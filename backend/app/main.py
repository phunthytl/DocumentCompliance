from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.base import Base
# Import các model để SQLAlchemy nhận diện
from app.models.user import User
from app.models.rule import RuleConfig
from app.models.document import Document
from app.models.content_rule import ContentRuleConfig
from app.models.template import DocumentTemplate

# Tạo các bảng trong database
Base.metadata.create_all(bind=engine)

def init_db():
    from app.core.database import SessionLocal
    from app.core.security import get_password_hash
    from app.core.rules_config import DEFAULT_RULES
    
    db = SessionLocal()
    try:
        # 1. Tạo tài khoản admin nếu chưa có
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("123456"),
                full_name="Quản trị viên",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("Đã tạo tài khoản admin mặc định: admin / 123456")
            
        # 2. Khởi tạo các rule mặc định nếu chưa có
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
                
            if name not in existing_names:
                rule = RuleConfig(
                    name=name,
                    description=f"Quy tắc hệ thống cho {key}",
                    rules_json=rule_data,
                    is_global=True,
                    owner_id=admin.id
                )
                db.add(rule)
        db.commit()
        print("Đã kiểm tra và khởi tạo các rule hệ thống.")
    except Exception as e:
        print(f"Lỗi khi khởi tạo DB: {e}")
    finally:
        db.close()

# Chạy khởi tạo
init_db()

app = FastAPI(
    title="Document Compliance Agent",
    description="API for Document Compliance Agent",
    version="1.0.0",
)

# Cấu hình CORS
origins = [
    "*", # Cho phép mọi nguồn truy cập (để dễ dàng test trên Vercel)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import documents, rules, auth, ai, templates, admin, users

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(rules.router)
app.include_router(ai.router)
app.include_router(templates.router)
app.include_router(admin.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Document Compliance Agent API"}
