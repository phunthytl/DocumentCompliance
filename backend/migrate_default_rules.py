import os
import sys
# Thêm backend_dir vào PYTHONPATH
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.models.rule import RuleConfig
from app.models.user import User
from app.models.document import Document
from app.models.template import DocumentTemplate
from app.core.rules_config import DEFAULT_RULES

def migrate():
    db = SessionLocal()
    
    admin = db.query(User).filter(User.role == "admin").first()
    if not admin:
        print("No admin user found. Please create an admin first.")
        return

    # Kiểm tra xem đã có rule mặc định nào trong DB chưa
    existing_rules = db.query(RuleConfig).filter(RuleConfig.is_global == True).all()
    existing_names = [r.name for r in existing_rules]

    for key, rule_data in DEFAULT_RULES.items():
        name = ""
        if key == "academic":
            name = "Mặc định - Học thuật (Khóa luận, Báo cáo)"
        elif key == "business":
            name = "Mặc định - Doanh nghiệp (Công văn, Báo cáo)"
        elif key == "contract":
            name = "Mặc định - Hợp đồng (Pháp lý)"
            
        if name in existing_names:
            print(f"Rule {name} already exists, skipping.")
            continue
            
        rule = RuleConfig(
            name=name,
            description=f"Quy tắc mặc định cho {key}",
            rules_json=rule_data,
            is_global=True,
            owner_id=admin.id
        )
        db.add(rule)

    db.commit()
    print("Default rules migrated to global rules in DB successfully!")

if __name__ == "__main__":
    migrate()
