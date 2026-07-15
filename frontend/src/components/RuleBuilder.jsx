import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';

const RuleBuilder = ({ onBack, isAdminMode = false }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('page_setup');

    // AI Extract States
    const [extracting, setExtracting] = useState(false);
    const [extractText, setExtractText] = useState('');
    const [showVipModal, setShowVipModal] = useState(false);

    // Rule Form States
    const [name, setName] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);
    const [margin, setMargin] = useState({ top: 2.0, bottom: 2.0, left: 3.0, right: 2.0 });
    const [pageSetup, setPageSetup] = useState({ line_spacing: 1.5, spacing_before: 0, spacing_after: 0 });
    const [styles, setStyles] = useState({
        "Normal": { font_name: "Times New Roman", font_size: 13.0, bold: false, italic: false, alignment: "justified", uppercase: false },
        "Heading 1": { font_name: "Times New Roman", font_size: 16.0, bold: true, italic: false, alignment: "center", uppercase: true },
        "Heading 2": { font_name: "Times New Roman", font_size: 14.0, bold: true, italic: false, alignment: "left", uppercase: false },
        "Heading 3": { font_name: "Times New Roman", font_size: 13.0, bold: true, italic: false, alignment: "left", uppercase: false }
    });

    const [formMessage, setFormMessage] = useState('');

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://documentcompliance.onrender.com/api/rules/', getAuthConfig());
            setRules(response.data);
        } catch (err) {
            setError('Không thể tải danh sách Rule.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const openModal = (rule = null) => {
        if (rule) {
            setEditingId(rule.id);
            setName(rule.name);
            setIsGlobal(rule.is_global || false);
            const json = rule.rules_json || {};
            setMargin(json.margin_cm || { top: 2.0, bottom: 2.0, left: 3.0, right: 2.0 });
            setPageSetup(json.page_setup || { line_spacing: 1.5, spacing_before: 0, spacing_after: 0 });

            const defaultStyles = {
                "Normal": { font_name: "Times New Roman", font_size: 13.0, bold: false, italic: false, alignment: "justified", uppercase: false },
                "Heading 1": { font_name: "Times New Roman", font_size: 16.0, bold: true, italic: false, alignment: "center", uppercase: true },
                "Heading 2": { font_name: "Times New Roman", font_size: 14.0, bold: true, italic: false, alignment: "left", uppercase: false },
                "Heading 3": { font_name: "Times New Roman", font_size: 13.0, bold: true, italic: false, alignment: "left", uppercase: false }
            };
            setStyles(json.styles || defaultStyles);
        } else {
            setEditingId(null);
            setName('');
            setIsGlobal(false);
            setMargin({ top: 2.0, bottom: 2.0, left: 3.0, right: 2.0 });
            setPageSetup({ line_spacing: 1.5, spacing_before: 0, spacing_after: 0 });
            setStyles({
                "Normal": { font_name: "Times New Roman", font_size: 13.0, bold: false, italic: false, alignment: "justified", uppercase: false },
                "Heading 1": { font_name: "Times New Roman", font_size: 16.0, bold: true, italic: false, alignment: "center", uppercase: true },
                "Heading 2": { font_name: "Times New Roman", font_size: 14.0, bold: true, italic: false, alignment: "left", uppercase: false },
                "Heading 3": { font_name: "Times New Roman", font_size: 13.0, bold: true, italic: false, alignment: "left", uppercase: false }
            });
        }
        setExtractText('');
        setFormMessage('');
        setActiveTab('page_setup');
        setIsModalOpen(true);
    };

    const handleExtract = async () => {
        if (!extractText.trim()) return;
        setExtracting(true);
        setFormMessage('');
        try {
            const formData = new FormData();
            formData.append('text_content', extractText);
            const res = await axios.post('https://documentcompliance.onrender.com/api/rules/extract', formData, getAuthConfig());
            const json = res.data;
            if (json.margin_cm) setMargin(json.margin_cm);
            if (json.page_setup) setPageSetup(json.page_setup);
            if (json.styles) setStyles(json.styles);
            setActiveTab('page_setup');
            setFormMessage('Đã trích xuất thành công! Vui lòng kiểm tra lại các thông số.');
        } catch (err) {
            if (err.response?.status === 403) {
                setShowVipModal(true);
            } else {
                setFormMessage('Lỗi phân tích AI: ' + (err.response?.data?.detail || err.message));
            }
        }
        setExtracting(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setExtracting(true);
        setFormMessage('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post('https://documentcompliance.onrender.com/api/rules/extract', formData, getAuthConfig());
            const json = res.data;
            if (json.margin_cm) setMargin(json.margin_cm);
            if (json.page_setup) setPageSetup(json.page_setup);
            if (json.styles) setStyles(json.styles);
            setActiveTab('page_setup');
            setFormMessage('Đã trích xuất thành công! Vui lòng kiểm tra lại các thông số.');
        } catch (err) {
            if (err.response?.status === 403) {
                setShowVipModal(true);
            } else {
                setFormMessage('Lỗi phân tích AI: ' + (err.response?.data?.detail || err.message));
            }
        }
        e.target.value = null;
        setExtracting(false);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setFormMessage('Vui lòng nhập tên bộ quy tắc.');
            return;
        }
        try {
            const rulesJson = {
                margin_cm: {
                    top: parseFloat(margin.top), bottom: parseFloat(margin.bottom),
                    left: parseFloat(margin.left), right: parseFloat(margin.right)
                },
                page_setup: {
                    line_spacing: parseFloat(pageSetup.line_spacing),
                    spacing_before: parseFloat(pageSetup.spacing_before),
                    spacing_after: parseFloat(pageSetup.spacing_after)
                },
                styles: {
                    "Normal": { ...styles["Normal"], font_size: parseFloat(styles["Normal"].font_size) },
                    "Heading 1": { ...styles["Heading 1"], font_size: parseFloat(styles["Heading 1"].font_size) },
                    "Heading 2": { ...styles["Heading 2"], font_size: parseFloat(styles["Heading 2"].font_size) },
                    "Heading 3": { ...styles["Heading 3"], font_size: parseFloat(styles["Heading 3"].font_size) }
                }
            };

            const payload = {
                name,
                description: 'Tùy chỉnh đa cấp độ',
                rules_json: rulesJson,
                is_global: isGlobal
            };

            if (editingId) {
                await axios.put(`https://documentcompliance.onrender.com/api/rules/${editingId}`, payload, getAuthConfig());
            } else {
                await axios.post('https://documentcompliance.onrender.com/api/rules/', payload, getAuthConfig());
            }

            setIsModalOpen(false);
            fetchRules();
        } catch (err) {
            setFormMessage('Lỗi khi lưu cấu hình.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa Rule này?')) {
            try {
                await axios.delete(`https://documentcompliance.onrender.com/api/rules/${id}`, getAuthConfig());
                fetchRules();
            } catch (err) {
                alert('Có lỗi xảy ra khi xóa Rule.');
            }
        }
    };

    const handleMakeVip = async () => {
        try {
            await axios.post('https://documentcompliance.onrender.com/api/auth/make-vip', {}, getAuthConfig());
            localStorage.setItem('user_role', 'vip');
            setShowVipModal(false);
            alert('Tài khoản đã được nâng cấp lên VIP! Bạn có thể nhấn Phân tích AI lại.');
            window.location.reload();
        } catch (err) {
            alert('Lỗi khi nâng cấp VIP');
        }
    };

    const updateStyle = (styleKey, field, value) => {
        setStyles(prev => ({
            ...prev,
            [styleKey]: {
                ...prev[styleKey],
                [field]: value
            }
        }));
    };

    const renderStyleForm = (styleKey) => {
        const s = styles[styleKey];
        return (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">{styleKey}</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Font</label>
                        <input type="text" value={s.font_name} onChange={(e) => updateStyle(styleKey, 'font_name', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Cỡ chữ (pt)</label>
                        <input type="number" step="0.5" value={s.font_size} onChange={(e) => updateStyle(styleKey, 'font_size', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Căn lề</label>
                        <select value={s.alignment} onChange={(e) => updateStyle(styleKey, 'alignment', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500">
                            <option value="left">Trái (Left)</option>
                            <option value="center">Giữa (Center)</option>
                            <option value="right">Phải (Right)</option>
                            <option value="justified">Đều 2 bên (Justified)</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-4 pt-5">
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={s.bold} onChange={(e) => updateStyle(styleKey, 'bold', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span>In đậm</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={s.italic} onChange={(e) => updateStyle(styleKey, 'italic', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span>In nghiêng</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={s.uppercase} onChange={(e) => updateStyle(styleKey, 'uppercase', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span>In hoa</span>
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Thiết lập Quy tắc Định dạng</h2>
                    <p className="text-gray-500 mt-2 text-lg">Quản lý tiêu chuẩn chi tiết (Margin, Heading 1-3, Normal Text)</p>
                </div>
                {(!isAdminMode || isAdminMode) && ( // Hiện tại ai cũng có thể tạo Rule
                    <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center space-x-2 transition-colors shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span>Thêm Rule mới</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-gray-500">Đang tải dữ liệu...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-4 font-semibold">Tên Quy Tắc</th>
                                <th className="px-6 py-4 font-semibold">Căn lề (T-D-T-P)</th>
                                <th className="px-6 py-4 font-semibold">Font Normal</th>
                                <th className="px-6 py-4 font-semibold">Font Heading 1</th>
                                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rules.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chưa có quy tắc nào. Hãy tạo mới!</td></tr>
                            ) : (
                                rules.map(rule => (
                                    <tr key={rule.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <span>{rule.name}</span>
                                                {rule.is_global && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 tracking-wider">SYSTEM</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {rule.rules_json?.margin_cm ? `${rule.rules_json.margin_cm.top} - ${rule.rules_json.margin_cm.bottom} - ${rule.rules_json.margin_cm.left} - ${rule.rules_json.margin_cm.right}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{rule.rules_json?.styles?.Normal?.font_name || rule.rules_json?.font_name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-600">{rule.rules_json?.styles?.['Heading 1']?.font_name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Ẩn nút Sửa/Xóa nếu là Global Rule và đang ở chế độ User thường */}
                                            {(!rule.is_global || isAdminMode) && (
                                                <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openModal(rule)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">

                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
                                {editingId ? <span>Chỉnh sửa Quy tắc Đa cấp độ</span> : <span>Thêm Quy tắc Đa cấp độ mới</span>}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Tabs */}
                            <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
                                <button onClick={() => setActiveTab('ai_extract')} className={`w-full flex items-center space-x-2 text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'ai_extract' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Tự động bằng AI</span>
                                </button>
                                <div className="h-4"></div>
                                <button onClick={() => setActiveTab('page_setup')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'page_setup' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}>Trang in & Cách dòng</button>
                                <button onClick={() => setActiveTab('normal')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'normal' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}>Văn bản (Normal)</button>
                                <button onClick={() => setActiveTab('headings')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'headings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}>Các Tiêu đề (Headings)</button>
                            </div>

                            {/* Content Tab */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="mb-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Tên Bộ Quy Tắc</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Báo cáo kỹ thuật, Khóa luận..." className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
                                    </div>
                                    {isAdminMode && (
                                        <div>
                                            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-2 border border-gray-200 rounded-md bg-gray-50 w-fit">
                                                <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                                <span className="font-semibold text-indigo-900">Quy tắc Toàn cục (Global System Rule)</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {activeTab === 'ai_extract' && (
                                    <div className="space-y-6">
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                                            <h4 className="font-bold text-indigo-900 mb-2">Trích xuất Tự động bằng AI</h4>
                                            <p className="text-sm text-indigo-700 mb-4">Tải lên file quy định (.txt, .docx) hoặc dán trực tiếp đoạn văn bản mô tả quy định định dạng. AI sẽ tự động phân tích và điền vào form.</p>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tải file quy định</label>
                                                    <input type="file" accept=".txt,.docx" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors cursor-pointer" />
                                                </div>

                                                <div className="relative flex items-center py-2">
                                                    <div className="flex-grow border-t border-indigo-200"></div>
                                                    <span className="flex-shrink-0 mx-4 text-indigo-400 text-sm font-medium">HOẶC DÁN VĂN BẢN</span>
                                                    <div className="flex-grow border-t border-indigo-200"></div>
                                                </div>

                                                <div>
                                                    <textarea
                                                        rows="6"
                                                        value={extractText}
                                                        onChange={(e) => setExtractText(e.target.value)}
                                                        placeholder="Dán nội dung quy định vào đây..."
                                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm resize-none"
                                                    ></textarea>
                                                </div>

                                                <button
                                                    onClick={handleExtract}
                                                    disabled={extracting || !extractText.trim()}
                                                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors shadow-sm flex items-center justify-center space-x-2"
                                                >
                                                    {extracting ? (
                                                        <span>Đang phân tích (Khoảng 5-10s)...</span>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4" />
                                                            <span>Phân tích Văn bản này</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'page_setup' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">Căn lề (Margin - cm)</h4>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Trái</label>
                                                    <input type="number" step="0.1" value={margin.left} onChange={(e) => setMargin({ ...margin, left: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 text-center" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Phải</label>
                                                    <input type="number" step="0.1" value={margin.right} onChange={(e) => setMargin({ ...margin, right: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 text-center" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Trên</label>
                                                    <input type="number" step="0.1" value={margin.top} onChange={(e) => setMargin({ ...margin, top: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 text-center" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Dưới</label>
                                                    <input type="number" step="0.1" value={margin.bottom} onChange={(e) => setMargin({ ...margin, bottom: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 text-center" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">Khoảng cách đoạn (Spacing)</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Cách dòng (Line)</label>
                                                    <input type="number" step="0.1" value={pageSetup.line_spacing} onChange={(e) => setPageSetup({ ...pageSetup, line_spacing: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Trước (Before - pt)</label>
                                                    <input type="number" value={pageSetup.spacing_before} onChange={(e) => setPageSetup({ ...pageSetup, spacing_before: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Sau (After - pt)</label>
                                                    <input type="number" value={pageSetup.spacing_after} onChange={(e) => setPageSetup({ ...pageSetup, spacing_after: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'normal' && (
                                    <div>
                                        {renderStyleForm("Normal")}
                                    </div>
                                )}

                                {activeTab === 'headings' && (
                                    <div className="space-y-6">
                                        {renderStyleForm("Heading 1")}
                                        {renderStyleForm("Heading 2")}
                                        {renderStyleForm("Heading 3")}
                                    </div>
                                )}

                                {formMessage && (
                                    <div className={`mt-4 flex items-center space-x-2 p-3 rounded-md border text-sm ${formMessage.includes('thành công') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{formMessage}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50 rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors">Hủy bỏ</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center space-x-2 transition-colors shadow-sm">
                                <Save className="w-4 h-4" />
                                <span>Lưu Bộ Quy tắc</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Modal Upgrade VIP */}
            {showVipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>

                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BrainCircuit className="w-10 h-10 text-amber-500" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Tính năng Cao cấp</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Tính năng Trích xuất Quy tắc tự động bằng AI là độc quyền dành cho thành viên VIP. Hãy nâng cấp để sử dụng nhé!
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleMakeVip}
                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-[1.02]"
                            >
                                Nâng cấp VIP (Môi trường Test)
                            </button>
                            <button
                                onClick={() => setShowVipModal(false)}
                                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Để sau
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleBuilder;
