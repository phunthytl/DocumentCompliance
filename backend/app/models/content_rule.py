from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class ContentRuleConfig(Base):
    __tablename__ = "content_rule_configs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=True) # ID của công ty/người quản lý
    document_type = Column(String, index=True, nullable=False) # VD: "academic", "business", "contract"
    
    # Danh sách các tiêu chí nội dung cần đánh giá
    criteria = Column(JSON, nullable=False)
    
    # System prompt gốc
    base_prompt = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tenant = relationship("User")
