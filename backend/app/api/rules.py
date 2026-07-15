from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.rule import RuleConfig
from app.api.auth import get_current_user
from app.models.user import User
import uuid

router = APIRouter(prefix="/api/rules", tags=["rules"])

class RuleCreate(BaseModel):
    name: str
    description: str = None
    rules_json: Dict[str, Any]
    is_global: bool = False

@router.post("/", response_model=dict)
def create_rule(rule_data: RuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Chỉ Admin mới được quyền tạo Rule Global
    is_global = rule_data.is_global if current_user.role == "admin" else False
    
    new_rule = RuleConfig(
        name=rule_data.name,
        description=rule_data.description,
        rules_json=rule_data.rules_json,
        is_global=is_global,
        owner_id=current_user.id
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return {"message": "Rule created successfully", "id": new_rule.id}


@router.get("/")
def get_rules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Trả về rules của người dùng hoặc rules global
    rules = db.query(RuleConfig).filter(
        (RuleConfig.owner_id == current_user.id) | (RuleConfig.is_global == True)
    ).all()
    return rules

@router.put("/{rule_id}")
def update_rule(rule_id: int, rule_data: RuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rule = db.query(RuleConfig).filter(RuleConfig.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    # Admin sửa được mọi thứ, User chỉ sửa được của mình
    if rule.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền sửa Rule này")
    
    rule.name = rule_data.name
    rule.description = rule_data.description
    rule.rules_json = rule_data.rules_json
    if current_user.role == "admin":
        rule.is_global = rule_data.is_global
    
    db.commit()
    db.refresh(rule)
    return {"message": "Rule updated successfully", "id": rule.id}

@router.delete("/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rule = db.query(RuleConfig).filter(RuleConfig.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    # Admin xóa được mọi thứ, User chỉ xóa được của mình
    if rule.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa Rule này")
    
    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted successfully"}

import google.generativeai as genai
import os
import json
import docx2txt
from fastapi import UploadFile, File, Form

# Cấu hình API Key tự động từ .env
api_key = os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.post("/extract")
async def extract_rules(
    file: UploadFile = File(None),
    text_content: str = Form(None),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["vip", "admin"]:
        raise HTTPException(status_code=403, detail="Tài khoản của bạn cần được nâng cấp VIP để dùng tính năng Trích xuất Quy tắc AI.")

    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GOOGLE_API_KEY")
        
    if not file and not text_content:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp file hoặc text")
        
    text = ""
    if file:
        if file.filename.endswith(".docx"):
            # Giới hạn kích thước
            file_content = await file.read()
            if len(file_content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Kích thước file vượt quá giới hạn 10MB")
                
            temp_path = f"{uuid.uuid4().hex}.docx"
            try:
                with open(temp_path, "wb") as f:
                    f.write(file_content)
                text = docx2txt.process(temp_path)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Tính năng trích xuất AI chỉ hỗ trợ file .docx hoặc text")
    else:
        text = text_content
        
    prompt = f"""
    Bạn là một chuyên gia phân tích quy định văn bản.
    Hãy đọc quy định định dạng sau và trích xuất thành định dạng JSON chuẩn.
    Nếu có thông tin nào không được đề cập, hãy dùng giá trị mặc định hợp lý.
    Cấu trúc JSON yêu cầu:
    {{
      "margin_cm": {{ "top": 2.0, "bottom": 2.0, "left": 3.0, "right": 2.0 }},
      "page_setup": {{ "line_spacing": 1.5, "spacing_before": 0, "spacing_after": 0 }},
      "styles": {{
        "Heading 1": {{ "font_name": "Times New Roman", "font_size": 16.0, "bold": true, "italic": false, "alignment": "center", "uppercase": true }},
        "Heading 2": {{ "font_name": "Times New Roman", "font_size": 14.0, "bold": true, "italic": false, "alignment": "left", "uppercase": false }},
        "Heading 3": {{ "font_name": "Times New Roman", "font_size": 13.0, "bold": true, "italic": false, "alignment": "left", "uppercase": false }},
        "Normal": {{ "font_name": "Times New Roman", "font_size": 13.0, "bold": false, "italic": false, "alignment": "justified", "uppercase": false }}
      }}
    }}
    Chỉ trả về chuỗi JSON hợp lệ. Dựa vào nội dung sau:
    {text}
    """
    try:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        except Exception:
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(prompt)
        
        # Đảm bảo response trả về JSON
        text_resp = response.text
        if text_resp.startswith("```json"):
            text_resp = text_resp.replace("```json", "").replace("```", "").strip()
        elif text_resp.startswith("```"):
            text_resp = text_resp.replace("```", "").strip()
            
        return json.loads(text_resp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
