from sqlalchemy.orm import Session
from app.models.content_rule import ContentRuleConfig
import json

class AIPromptEngine:
    def __init__(self, db: Session):
        self.db = db
        
    def get_prompt_for_document(self, document_type: str, text: str, custom_prompt: str = None, tenant_id: int = None) -> str:
        # Tìm rule theo tenant_id (ưu tiên)
        rule = None
        if tenant_id:
            rule = self.db.query(ContentRuleConfig).filter(
                ContentRuleConfig.document_type == document_type,
                ContentRuleConfig.tenant_id == tenant_id
            ).first()
            
        # Fallback lấy rule chung (không có tenant)
        if not rule:
            rule = self.db.query(ContentRuleConfig).filter(
                ContentRuleConfig.document_type == document_type,
                ContentRuleConfig.tenant_id == None
            ).first()
            
        # Nếu vẫn không có rule nào, dùng cấu hình mặc định (hardcode fallback)
        if not rule:
            base_prompt = "Bạn là một chuyên gia đánh giá tài liệu. Hãy đọc tài liệu dưới đây và đưa ra đánh giá phân tích sâu sắc về nội dung, cấu trúc, văn phong và logic."
            criteria = []
        else:
            base_prompt = rule.base_prompt
            criteria = rule.criteria if isinstance(rule.criteria, list) else []

        # Lắp ráp Prompt
        system_instruction = f"""
{base_prompt}
Trích xuất đánh giá dưới định dạng JSON chuẩn với cấu trúc sau:
{{
  "overall_score": <điểm số tổng quan từ 0-100>,
  "summary": "<Tóm tắt ngắn gọn 2-3 câu về nội dung báo cáo>",
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>"],
  "weaknesses": ["<điểm yếu 1>", "<điểm yếu 2>"],
  "detailed_feedback": "<Phân tích chi tiết thành một bài viết nhỏ dùng markdown, chỉ ra lỗi logic, văn phong, cấu trúc>"
}}
"""

        # Thêm criteria của công ty/tài liệu
        if criteria:
            system_instruction += "\n\nCÁC TIÊU CHÍ BẮT BUỘC PHẢI KIỂM TRA:\n"
            for idx, criterion in enumerate(criteria):
                system_instruction += f"{idx + 1}. {criterion}\n"
            system_instruction += "Lưu ý: Nếu tài liệu vi phạm bất kỳ tiêu chí nào ở trên, hãy trừ điểm overall_score và giải thích rõ ràng trong detailed_feedback."

        # Thêm yêu cầu custom của user
        if custom_prompt and custom_prompt.strip():
            system_instruction += f"\n\nYÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG: {custom_prompt}\nHãy chú ý đáp ứng yêu cầu này trong phần detailed_feedback."

        prompt = f"{system_instruction}\n\nNỘI DUNG TÀI LIỆU:\n{text}"
        return prompt
