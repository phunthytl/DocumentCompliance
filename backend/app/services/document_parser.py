from docx import Document
import os

def map_alignment(alignment_value):
    if alignment_value == 0: return "left"
    if alignment_value == 1: return "center"
    if alignment_value == 2: return "right"
    if alignment_value == 3: return "justified"
    return "left" # default

def get_effective_font_prop(run, para, prop_name, default_val=None):
    if getattr(run.font, prop_name) is not None:
        val = getattr(run.font, prop_name)
        return val.pt if prop_name == 'size' else val
        
    style = para.style
    while style:
        if getattr(style.font, prop_name) is not None:
            val = getattr(style.font, prop_name)
            return val.pt if prop_name == 'size' else val
        style = style.base_style
    return default_val

class DocumentParser:
    def __init__(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        self.doc = Document(file_path)
        self.default_font = "Times New Roman"
        self.default_size = 13.0
        self._extract_document_defaults()

    def _extract_document_defaults(self):
        try:
            fonts = self.doc.styles.element.xpath('w:docDefaults/w:rPrDefault/w:rPr/w:rFonts')
            if fonts:
                font_el = fonts[0]
                ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
                ascii_font = font_el.get(f'{ns}ascii')
                if ascii_font:
                    self.default_font = ascii_font
                else:
                    theme = font_el.get(f'{ns}asciiTheme')
                    if theme == 'minorHAnsi':
                        self.default_font = 'Calibri'
                    elif theme == 'majorHAnsi':
                        self.default_font = 'Calibri Light'
                    elif theme:
                        # Fallback heuristic
                        self.default_font = 'Calibri'
            
            sizes = self.doc.styles.element.xpath('w:docDefaults/w:rPrDefault/w:rPr/w:sz/@w:val')
            if sizes:
                self.default_size = float(sizes[0]) / 2.0
        except Exception:
            pass

    def extract_paragraphs_info(self):
        """Trích xuất thông tin các đoạn văn bản"""
        paragraphs_info = []
        for i, para in enumerate(self.doc.paragraphs):
            # Bỏ qua đoạn trống
            if not para.text.strip():
                continue
                
            fmt = para.paragraph_format
            
            info = {
                "index": i,
                "text": para.text,
                "style": para.style.name,
                "alignment": map_alignment(para.alignment),
                "line_spacing": fmt.line_spacing if hasattr(fmt, "line_spacing") else None,
                "space_before": fmt.space_before.pt if hasattr(fmt, "space_before") and fmt.space_before else 0,
                "space_after": fmt.space_after.pt if hasattr(fmt, "space_after") and fmt.space_after else 0,
                "runs": []
            }
            
            # Trích xuất thông tin chi tiết từng đoạn nhỏ (run)
            for j, run in enumerate(para.runs):
                if run.text.strip():
                    run_info = {
                        "index": j,
                        "text": run.text,
                        "font_name": get_effective_font_prop(run, para, 'name', self.default_font),
                        "font_size": get_effective_font_prop(run, para, 'size', self.default_size),
                        "bold": get_effective_font_prop(run, para, 'bold', False),
                        "italic": get_effective_font_prop(run, para, 'italic', False),
                        "uppercase": get_effective_font_prop(run, para, 'all_caps', False) or run.text.isupper()
                    }
                    info["runs"].append(run_info)
                    
            paragraphs_info.append(info)
        return paragraphs_info
    
    def extract_document_info(self):
        """Lấy toàn bộ thông tin tài liệu cần kiểm tra"""
        sections = self.doc.sections
        margins = []
        for sec in sections:
            # Lấy thông tin margin (đổi từ EMU sang cm)
            margins.append({
                "top": sec.top_margin.cm if sec.top_margin else None,
                "bottom": sec.bottom_margin.cm if sec.bottom_margin else None,
                "left": sec.left_margin.cm if sec.left_margin else None,
                "right": sec.right_margin.cm if sec.right_margin else None
            })

        return {
            "margins": margins,
            "paragraphs": self.extract_paragraphs_info()
        }
