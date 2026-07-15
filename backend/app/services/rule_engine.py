class RuleEngine:
    def __init__(self, document_info: dict, rules: dict):
        self.doc_info = document_info
        self.report = {
            "score": 100,
            "errors": [],
            "warnings": [],
            "details": {}
        }
        self.rules = rules

    def _add_error(self, error_obj: dict, deduction: int):
        self.report["errors"].append(error_obj)
        self.report["score"] -= deduction

    def _add_warning(self, message: str):
        self.report["warnings"].append(message)

    def evaluate(self):
        """Chạy đánh giá các rule"""
        self.check_margins()
        self.check_page_setup()
        self.check_typography()
        
        # Đảm bảo điểm không âm
        if self.report["score"] < 0:
            self.report["score"] = 0
            
        return self.report

    def check_margins(self):
        margins = self.doc_info.get("margins", [])
        if not margins:
            return
            
        first_sec = margins[0]
        rules = self.rules.get("margin_cm")
        if not rules:
            return
            
        def is_valid_margin(actual, expected):
            return actual is not None and abs(actual - expected) < 0.1

        for side in ["top", "bottom", "left", "right"]:
            if side in rules and side in first_sec:
                if not is_valid_margin(first_sec[side], rules[side]):
                    self._add_error({
                        "id": f"margin_{side}",
                        "type": "margin",
                        "message": f"Lề {side} đang là {first_sec[side]:.2f}cm (yêu cầu {rules[side]}cm)",
                        "fix_data": {"property": side, "value": rules[side]}
                    }, 5)

    def check_page_setup(self):
        paragraphs = self.doc_info.get("paragraphs", [])
        page_setup = self.rules.get("page_setup")
        if not page_setup or not paragraphs:
            return
            
        expected_line_spacing = page_setup.get("line_spacing")
        expected_before = page_setup.get("spacing_before")
        expected_after = page_setup.get("spacing_after")
        
        # Quét toàn bộ tài liệu (vì lỗi đã được gom nhóm tự động trên UI)
        for para in paragraphs:
            para_idx = para["index"]
            
            # Line spacing
            ls = para.get("line_spacing")
            if ls is not None and expected_line_spacing is not None:
                # docx line_spacing trả về giá trị khác nhau tùy cấu hình, thường là số float như 1.5, 1.15
                if abs(ls - expected_line_spacing) > 0.1:
                    self._add_error({
                        "id": f"line_spacing_p{para_idx}",
                        "type": "paragraph",
                        "message": f"Sai cách dòng: đang là {ls:.1f} (yêu cầu {expected_line_spacing})",
                        "fix_data": {"para_index": para_idx, "property": "line_spacing", "value": expected_line_spacing}
                    }, 2)
            
            # Spacing before
            sb = para.get("space_before")
            if sb is not None and expected_before is not None:
                if abs(sb - expected_before) > 1.0: # allow 1pt tolerance
                    self._add_error({
                        "id": f"spacing_before_p{para_idx}",
                        "type": "paragraph",
                        "message": f"Khoảng cách trước đoạn đang là {sb}pt (yêu cầu {expected_before}pt)",
                        "fix_data": {"para_index": para_idx, "property": "spacing_before", "value": expected_before}
                    }, 1)
            
            # Spacing after
            sa = para.get("space_after")
            if sa is not None and expected_after is not None:
                if abs(sa - expected_after) > 1.0:
                    self._add_error({
                        "id": f"spacing_after_p{para_idx}",
                        "type": "paragraph",
                        "message": f"Khoảng cách sau đoạn đang là {sa}pt (yêu cầu {expected_after}pt)",
                        "fix_data": {"para_index": para_idx, "property": "spacing_after", "value": expected_after}
                    }, 1)

    def check_typography(self):
        paragraphs = self.doc_info.get("paragraphs", [])
        styles_rules = self.rules.get("styles", {})
        
        # Hỗ trợ tương thích ngược nếu db dùng cấu trúc cũ
        legacy_font = self.rules.get("font_name")
        legacy_sizes = self.rules.get("font_sizes", [])
        
        for para in paragraphs:
            para_idx = para["index"]
            style_name = para.get("style", "Normal")
            
            # Map style (nếu là Heading 1, 2, 3)
            rule = None
            if style_name in styles_rules:
                rule = styles_rules[style_name]
            elif "Normal" in styles_rules:
                rule = styles_rules["Normal"]
                
            if rule:
                expected_alignment = rule.get("alignment")
                alignment = para.get("alignment")
                if expected_alignment and alignment and alignment != expected_alignment:
                    self._add_error({
                        "id": f"alignment_p{para_idx}",
                        "type": "paragraph",
                        "message": f"[{style_name}] Căn lề đoạn đang là {alignment} (yêu cầu {expected_alignment})",
                        "fix_data": {"para_index": para_idx, "property": "alignment", "value": expected_alignment}
                    }, 2)

            for run in para.get("runs", []):
                run_idx = run.get("index")
                font_name = run.get("font_name")
                font_size = run.get("font_size")
                bold = run.get("bold")
                italic = run.get("italic")
                uppercase = run.get("uppercase")
                
                # Áp dụng rule mới
                if rule:
                    expected_font = rule.get("font_name")
                    expected_size = rule.get("font_size")
                    expected_bold = rule.get("bold")
                    expected_italic = rule.get("italic")
                    expected_uppercase = rule.get("uppercase")
                    
                    if expected_font and font_name and font_name != expected_font:
                        self._add_error({
                            "id": f"font_name_p{para_idx}_r{run_idx}",
                            "type": "typography",
                            "message": f"[{style_name}] Sai font: đang dùng {font_name} (yêu cầu {expected_font})",
                            "fix_data": {"para_index": para_idx, "run_index": run_idx, "property": "font_name", "value": expected_font}
                        }, 2)
                        
                    if expected_size and font_size and abs(font_size - expected_size) > 0.5:
                        self._add_error({
                            "id": f"font_size_p{para_idx}_r{run_idx}",
                            "type": "typography",
                            "message": f"[{style_name}] Sai cỡ chữ: đang dùng {font_size} (yêu cầu {expected_size})",
                            "fix_data": {"para_index": para_idx, "run_index": run_idx, "property": "font_size", "value": expected_size}
                        }, 2)
                        
                    if expected_bold is not None and bold is not None and bold != expected_bold:
                        msg = "Thiếu in đậm" if expected_bold else "Không được in đậm"
                        self._add_error({
                            "id": f"bold_p{para_idx}_r{run_idx}",
                            "type": "typography",
                            "message": f"[{style_name}] {msg}",
                            "fix_data": {"para_index": para_idx, "run_index": run_idx, "property": "bold", "value": expected_bold}
                        }, 1)
                
                # Áp dụng rule cũ (tương thích ngược)
                elif legacy_font and legacy_sizes:
                    if font_name and font_name != legacy_font:
                        self._add_error({
                            "id": f"font_name_p{para_idx}_r{run_idx}",
                            "type": "typography",
                            "message": f"Sai font chữ: đang dùng {font_name} (yêu cầu {legacy_font})",
                            "fix_data": {"para_index": para_idx, "run_index": run_idx, "property": "font_name", "value": legacy_font}
                        }, 2)
                    if font_size and font_size not in legacy_sizes:
                        self._add_error({
                            "id": f"font_size_p{para_idx}_r{run_idx}",
                            "type": "typography",
                            "message": f"Sai cỡ chữ: đang dùng {font_size} (yêu cầu {legacy_sizes[0] if legacy_sizes else ''})",
                            "fix_data": {"para_index": para_idx, "run_index": run_idx, "property": "font_size", "value": legacy_sizes[0]}
                        }, 2)
