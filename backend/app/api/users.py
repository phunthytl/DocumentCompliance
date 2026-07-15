from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền xem danh sách người dùng")
        
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active, "created_at": u.created_at} for u in users]

class UserRoleUpdate(BaseModel):
    role: str

@router.put("/{user_id}/role")
def update_user_role(user_id: int, role_data: UserRoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền đổi role")
        
    if role_data.role not in ["user", "vip", "admin"]:
        raise HTTPException(status_code=400, detail="Role không hợp lệ")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    if user.id == current_user.id and role_data.role != "admin":
        raise HTTPException(status_code=400, detail="Bạn không thể tự hạ quyền của chính mình")
        
    user.role = role_data.role
    db.commit()
    return {"message": f"Đã cấp quyền {role_data.role.upper()} cho user {user.email}"}

@router.put("/{user_id}/toggle-status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền đổi trạng thái")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Bạn không thể tự vô hiệu hóa tài khoản của chính mình")
        
    user.is_active = not user.is_active
    db.commit()
    
    status_str = "Kích hoạt" if user.is_active else "Vô hiệu hóa"
    return {"message": f"Đã {status_str} tài khoản {user.email}"}
