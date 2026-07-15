# Document Compliance Agent

## 1. Giới thiệu

**Document Compliance Agent** là hệ thống hỗ trợ kiểm tra, đánh giá và chuẩn hóa tài liệu theo các quy định của tổ chức bằng cách kết hợp **Rule Engine**, **AI Agent** và **Document Editor**.

Khác với các công cụ chỉ sửa nội dung bằng AI, hệ thống tập trung vào việc đảm bảo tài liệu tuân thủ các tiêu chuẩn về định dạng, cấu trúc và quy trình của doanh nghiệp, trường học hoặc cơ quan.

Người dùng có thể tải tài liệu lên, nhận đánh giá, chỉnh sửa trực tiếp trên trình duyệt và xuất ra phiên bản hoàn chỉnh.

---

# 2. Mục tiêu

* Chuẩn hóa tài liệu theo template của tổ chức.
* Giảm thời gian kiểm tra và chỉnh sửa tài liệu.
* Hỗ trợ người dùng chỉnh sửa trực tiếp trên giao diện web.
* Kết hợp AI và Rule Engine để đảm bảo độ chính xác và giảm chi phí sử dụng LLM.
* Cho phép mở rộng sang nhiều loại tài liệu như Word, Excel và PowerPoint.

---

# 3. Công nghệ

## Backend

* FastAPI
* Python
* SQLAlchemy
* PostgreSQL

## AI

* OpenAI / Gemini
* LangChain
* LangGraph (phiên bản nâng cao)

## Document Processing

* python-docx
* openpyxl
* python-pptx

## Document Editor

* ONLYOFFICE Docs

## Frontend

* React
* JavaScript
* Tailwind CSS

---

# 4. Kiến trúc hệ thống

```text
                User
                  │
                  ▼
          Upload Document
                  │
                  ▼
        ONLYOFFICE Editor
                  │
                  ▼
              FastAPI API
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 Document Parser      Knowledge Base
        │                   │
        ▼                   ▼
   Rule Engine        AI Reviewer
        │                   │
        └─────────┬─────────┘
                  ▼
        Compliance Analyzer
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
     Auto Fix         AI Rewrite
                  │
                  ▼
        Compliance Report
                  │
                  ▼
        Export DOCX / PDF
```

---

# 5. Chức năng

## 5.1 Upload tài liệu

Người dùng tải lên:

* DOCX
* XLSX
* PPTX

---

## 5.2 Document Parser

Trích xuất:

* Paragraph
* Table
* Heading
* Style
* Font
* Image
* Header
* Footer
* Metadata

---

## 5.3 Rule Engine

Kiểm tra:

* Font
* Font Size
* Margin
* Line Spacing
* Alignment
* Heading
* Numbering
* Caption
* Header/Footer
* Page Number
* Logo
* Watermark

Rule Engine không sử dụng AI nhằm đảm bảo tốc độ và độ chính xác.

---

## 5.4 Template Engine

Người quản trị tải lên template chuẩn.

Hệ thống phân tích template để tạo bộ quy tắc kiểm tra.

Ví dụ:

* Font
* Heading
* Margin
* Table Style
* Header/Footer

Các quy tắc được lưu trong cơ sở dữ liệu để tái sử dụng.

---

## 5.5 Knowledge Base

Lưu trữ:

* Quy định của tổ chức
* Quy trình nội bộ
* Hướng dẫn trình bày
* Mẫu biểu

AI sẽ truy xuất các tài liệu này bằng RAG khi cần đánh giá.

---

## 5.6 AI Reviewer

Đánh giá:

* Bố cục
* Logic
* Tính đầy đủ
* Tính mạch lạc
* Khả năng đọc
* Đề xuất cải thiện

Đây là phần chính sử dụng LLM.

---

## 5.7 Compliance Score

Ví dụ:

* Format: 100
* Structure: 90
* Citation: 80
* Grammar: 95

Tổng điểm:

92 / 100

---

## 5.8 Auto Fix

Các lỗi định dạng được sửa tự động bằng code.

Ví dụ:

* Font
* Margin
* Heading
* Numbering
* Alignment

Không cần gọi AI.

---

## 5.9 AI Rewrite

Người dùng có thể yêu cầu:

* Viết lại đoạn văn
* Tóm tắt
* Viết theo văn phong học thuật
* Viết theo văn phong doanh nghiệp

---

## 5.10 Compliance Report

Sinh báo cáo gồm:

* Tổng điểm
* Danh sách lỗi
* Danh sách cảnh báo
* Các thay đổi đã áp dụng
* Gợi ý cải thiện

Có thể xuất PDF.

---

# 6. ONLYOFFICE Integration

Người dùng chỉnh sửa trực tiếp trên trình duyệt.

Workflow:

1. Upload tài liệu.
2. Mở tài liệu trong ONLYOFFICE.
3. Hệ thống chạy Rule Engine và AI Reviewer.
4. Các lỗi được hiển thị ở thanh bên.
5. Người dùng chọn:

   * Chấp nhận sửa tự động.
   * Tự chỉnh sửa.
   * Bỏ qua.
6. Lưu phiên bản mới.

Mục tiêu là mang lại trải nghiệm gần giống Microsoft Word.

---

# 7. AI Agent Workflow

```text
Upload
    │
    ▼
Parser
    │
    ▼
Rule Engine
    │
    ▼
Knowledge Retrieval
    │
    ▼
AI Review
    │
    ▼
Need Fix?
    │
 ┌──┴──┐
 │     │
Yes    No
 │
 ▼
Auto Fix
 │
 ▼
Verification
 │
 ▼
Generate Report
 │
 ▼
Export
```

---

# 8. Roadmap

## Version 1

* Upload DOCX
* Rule Engine
* Compliance Report

## Version 2

* ONLYOFFICE Editor
* Auto Fix
* AI Review

## Version 3

* Knowledge Base
* RAG
* Template Engine

## Version 4

* Excel Support
* PowerPoint Support

## Version 5

* Multi-Agent
* Workflow Automation
* Organization Dashboard

---

# 9. Mục tiêu cuối cùng

Xây dựng một nền tảng giúp tổ chức:

* Chuẩn hóa tài liệu.
* Kiểm tra tuân thủ quy định.
* Giảm thời gian rà soát.
* Hỗ trợ người dùng chỉnh sửa trực tiếp trên web.
* Kết hợp AI và Rule Engine để tạo ra quy trình xử lý tài liệu hiệu quả, có khả năng mở rộng và phù hợp với môi trường doanh nghiệp.
