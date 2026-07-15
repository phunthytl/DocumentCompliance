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

# Tạo các bảng trong database (để test)
Base.metadata.create_all(bind=engine)

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
