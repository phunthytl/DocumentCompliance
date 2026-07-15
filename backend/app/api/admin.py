from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.template import DocumentTemplate
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Không có quyền truy cập")
        
    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    total_templates = db.query(DocumentTemplate).count()
    
    # Recent Activities
    recent_documents = db.query(Document).order_by(Document.uploaded_at.desc()).limit(5).all()
    recent_activities = []
    for doc in recent_documents:
        recent_activities.append({
            "id": doc.id,
            "filename": doc.filename,
            "uploaded_at": doc.uploaded_at.isoformat(),
            "owner_email": doc.owner.email if doc.owner else "Unknown"
        })
    
    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "total_templates": total_templates,
        "common_error": "Chưa có dữ liệu",
        "recent_activities": recent_activities
    }
