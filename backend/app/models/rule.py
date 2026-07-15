from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class RuleConfig(Base):
    __tablename__ = "rule_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # VD: "Báo cáo nội bộ", "Khóa luận"
    description = Column(String)
    
    # Lưu trữ config rules (font, size, margin) dưới dạng JSON
    rules_json = Column(JSON, nullable=False)
    
    is_global = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")
