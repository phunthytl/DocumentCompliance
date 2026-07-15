import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.template import DocumentTemplate
from app.models.document import Document
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATE_DIR = "templates"
UPLOAD_DIR = "uploads"
os.makedirs(TEMPLATE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024

@router.get("/")
def get_templates(db: Session = Depends(get_db)):
    templates = db.query(DocumentTemplate).all()
    return templates

@router.post("/upload")
async def upload_template(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(""),
    category: str = Form("business"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file .docx")

    # Kiểm tra kích thước
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước file vượt quá giới hạn 10MB")

    # Tạo tên an toàn
    safe_filename = f"template_{uuid.uuid4().hex}.docx"
    file_path = os.path.join(TEMPLATE_DIR, safe_filename)
    
    # Lưu file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
        
    try:
        new_template = DocumentTemplate(
            name=name,
            description=description,
            category=category,
            filename=safe_filename,
            owner_id=current_user.id
        )
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        
        return new_template
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{template_id}/use")
async def use_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    template = db.query(DocumentTemplate).filter(DocumentTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu tài liệu")
        
    template_path = os.path.join(TEMPLATE_DIR, template.filename)
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="File mẫu không tồn tại")
        
    # Copy file mẫu sang thư mục uploads cho user sử dụng
    new_filename = f"{uuid.uuid4().hex}.docx"
    new_filepath = os.path.join(UPLOAD_DIR, new_filename)
    shutil.copy2(template_path, new_filepath)
    
    # Tạo bản ghi Document mới
    try:
        new_doc = Document(
            filename=new_filename,
            status="draft", # Sử dụng trạng thái draft cho tài liệu tạo từ template
            owner_id=current_user.id
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        return {
            "document_id": new_doc.id,
            "filename": template.name + ".docx",
            "category": template.category,
            "message": "Đã tạo tài liệu từ mẫu thành công"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class TemplateUpdate(BaseModel):
    name: str
    description: str = None
    category: str = None

@router.put("/{template_id}")
def update_template(
    template_id: int,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền sửa mẫu")
        
    template = db.query(DocumentTemplate).filter(DocumentTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu")
        
    template.name = template_data.name
    if template_data.description is not None:
        template.description = template_data.description
    if template_data.category is not None:
        template.category = template_data.category
        
    db.commit()
    db.refresh(template)
    return {"message": "Đã cập nhật mẫu thành công", "template": template}

@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền xóa mẫu")
        
    template = db.query(DocumentTemplate).filter(DocumentTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu")
        
    # Xóa file vật lý
    template_path = os.path.join(TEMPLATE_DIR, template.filename)
    if os.path.exists(template_path):
        os.remove(template_path)
        
    db.delete(template)
    db.commit()
    return {"message": "Đã xóa mẫu thành công"}
