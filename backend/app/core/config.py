import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Compliance Agent"
    
    # Sử dụng SQLite cho giai đoạn đầu, dễ dàng chuyển sang MySQL bằng cách đổi URL này
    # Ví dụ MySQL: "mysql+pymysql://doc_user:doc_password@localhost:3306/doc_compliance"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./doc_compliance.db")
    GOOGLE_API_KEY: str = None

    class Config:
        env_file = ".env"

settings = Settings()
