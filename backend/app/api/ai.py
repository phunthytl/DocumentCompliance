from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
import google.generativeai as genai
import os
import json
import docx2txt
import uuid
from app.api.auth import get_current_user
from app.models.user import User
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_prompt_engine import AIPromptEngine

router = APIRouter(prefix="/api/ai", tags=["ai"])

api_key = os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

@router.post("/analyze-content")
async def analyze_content(
    file: UploadFile = File(...),
    custom_prompt: str = Form(None),
    document_type: str = Form("academic"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["vip", "admin"]:
        raise HTTPException(status_code=403, detail="Tài khoản của bạn cần được nâng cấp VIP để sử dụng tính năng Đánh giá bằng AI.")

    if not api_key:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GOOGLE_API_KEY")
        
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file định dạng .docx")

    # Đọc file để kiểm tra dung lượng
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước file vượt quá giới hạn 10MB")

    # Dùng uuid để lưu tên file tạm, tránh Path Traversal
    temp_path = f"{uuid.uuid4().hex}.docx"
    
    text = ""
    try:
        with open(temp_path, "wb") as f:
            f.write(file_content)
        text = docx2txt.process(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi khi trích xuất văn bản từ file")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # Xây dựng prompt động dựa vào AIPromptEngine
    prompt_engine = AIPromptEngine(db)
    prompt = prompt_engine.get_prompt_for_document(
        document_type=document_type,
        text=text,
        custom_prompt=custom_prompt,
        tenant_id=None # Ở giai đoạn này chúng ta tạm chưa dùng tenant_id, có thể mở rộng sau
    )

    try:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        except Exception:
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(prompt)
        
        text_resp = response.text
        if text_resp.startswith("```json"):
            text_resp = text_resp.replace("```json", "").replace("```", "").strip()
        elif text_resp.startswith("```"):
            text_resp = text_resp.replace("```", "").strip()
            
        return json.loads(text_resp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
