# Cấu hình rule chuẩn cho từng loại tài liệu

DEFAULT_RULES = {
    "academic": {
        "margin_cm": {
            "top": 2.5, "bottom": 2.5, "left": 3.0, "right": 2.0
        },
        "page_setup": {
            "line_spacing": 1.5,
            "spacing_before": 6,
            "spacing_after": 6
        },
        "styles": {
            "Heading 1": {
                "font_name": "Times New Roman",
                "font_size": 16.0,
                "bold": True,
                "italic": False,
                "alignment": "center",
                "uppercase": True
            },
            "Heading 2": {
                "font_name": "Times New Roman",
                "font_size": 13.0,
                "bold": True,
                "italic": False,
                "alignment": "left",
                "uppercase": False
            },
            "Heading 3": {
                "font_name": "Times New Roman",
                "font_size": 13.0,
                "bold": True,
                "italic": False,
                "alignment": "left",
                "uppercase": False
            },
            "Normal": {
                "font_name": "Times New Roman",
                "font_size": 13.0,
                "bold": False,
                "italic": False,
                "alignment": "justified",
                "uppercase": False
            }
        }
    },
    "business": {
        "margin_cm": {
            "top": 2.54, "bottom": 2.54, "left": 2.54, "right": 2.54
        },
        "page_setup": {
            "line_spacing": 1.15,
            "spacing_before": 0,
            "spacing_after": 8
        },
        "styles": {
            "Heading 1": { "font_name": "Arial", "font_size": 14.0, "bold": True, "italic": False, "alignment": "left", "uppercase": False },
            "Heading 2": { "font_name": "Arial", "font_size": 12.0, "bold": True, "italic": False, "alignment": "left", "uppercase": False },
            "Heading 3": { "font_name": "Arial", "font_size": 11.0, "bold": True, "italic": False, "alignment": "left", "uppercase": False },
            "Normal": { "font_name": "Arial", "font_size": 11.0, "bold": False, "italic": False, "alignment": "left", "uppercase": False }
        }
    },
    "contract": {
        "margin_cm": {
            "top": 2.0, "bottom": 2.0, "left": 3.0, "right": 1.5
        },
        "page_setup": {
            "line_spacing": 1.5,
            "spacing_before": 0,
            "spacing_after": 0
        },
        "styles": {
            "Heading 1": { "font_name": "Times New Roman", "font_size": 14.0, "bold": True, "italic": False, "alignment": "center", "uppercase": True },
            "Heading 2": { "font_name": "Times New Roman", "font_size": 14.0, "bold": True, "italic": False, "alignment": "left", "uppercase": False },
            "Heading 3": { "font_name": "Times New Roman", "font_size": 14.0, "bold": True, "italic": False, "alignment": "left", "uppercase": False },
            "Normal": { "font_name": "Times New Roman", "font_size": 14.0, "bold": False, "italic": False, "alignment": "justified", "uppercase": False }
        }
    }
}

def get_rules_for_type(doc_type: str) -> dict:
    return DEFAULT_RULES.get(doc_type, DEFAULT_RULES["academic"])
