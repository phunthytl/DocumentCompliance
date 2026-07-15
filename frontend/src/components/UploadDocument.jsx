import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader, Info, X } from 'lucide-react';

const UploadDocument = ({ onReportReceived }) => {
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('');
    const [customRules, setCustomRules] = useState([]);
    const [defaultRules, setDefaultRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal states cho việc xem chi tiết Rule
    const [showRuleDetail, setShowRuleDetail] = useState(false);
    const [selectedRuleData, setSelectedRuleData] = useState(null);

    useEffect(() => {
        // Tải danh sách rules từ API
        const fetchRules = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:8000/api/rules/', config);
                const allRules = res.data;
                const globals = allRules.filter(r => r.is_global);
                const customs = allRules.filter(r => !r.is_global);
                setCustomRules(customs);
                setDefaultRules(globals);
                if (globals.length > 0) {
                    setDocType(`rule_${globals[0].id}`);
                } else if (customs.length > 0) {
                    setDocType(`rule_${customs[0].id}`);
                }
            } catch (err) {
                console.error('Không thể tải rules', err);
            }
        };
        fetchRules();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Vui lòng chọn một tệp .docx');
            return;
        }

        if (!file.name.endsWith('.docx')) {
            setError('Hệ thống hiện chỉ hỗ trợ định dạng .docx');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            onReportReceived(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi tải lên tài liệu.');
        } finally {
            setLoading(false);
        }
    };

    const openRuleDetail = () => {
        if (!docType || !docType.startsWith('rule_')) return;
        const id = parseInt(docType.replace('rule_', ''));
        const rule = [...customRules, ...defaultRules].find(r => r.id === id);
        if (rule) {
            setSelectedRuleData({ name: rule.name, data: rule.rules_json });
            setShowRuleDetail(true);
        }
    };

    const renderStyleItem = (label, styleData) => {
        if (!styleData) return null;
        return (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h5 className="font-semibold text-gray-800 text-sm mb-2">{label}</h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">Font:</span> {styleData.font_name}</div>
                    <div><span className="font-medium">Cỡ chữ:</span> {styleData.font_size} pt</div>
                    <div><span className="font-medium">Căn lề:</span> {styleData.alignment}</div>
                    <div>
                        <span className="font-medium">Style:</span>{' '}
                        {styleData.bold && 'Đậm, '}
                        {styleData.italic && 'Nghiêng, '}
                        {styleData.uppercase && 'In hoa'}
                        {!styleData.bold && !styleData.italic && !styleData.uppercase && 'Thường'}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col relative">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tải lên tài liệu</h2>
                <p className="text-gray-500 mt-2 text-lg">Tải lên tệp word (.docx) để hệ thống AI đánh giá định dạng tự động.</p>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Quy chuẩn kiểm tra</label>
                    <div className="flex items-center space-x-3">
                        <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            {defaultRules.length > 0 && (
                                <optgroup label="Quy tắc Hệ thống (Toàn cục)" className="text-gray-700">
                                    {defaultRules.map((r) => (
                                        <option key={r.id} value={`rule_${r.id}`}>{r.name}</option>
                                    ))}
                                </optgroup>
                            )}
                            {customRules.length > 0 && (
                                <optgroup label="Quy tắc Cá nhân" className="text-gray-700 border-t">
                                    {customRules.map((r) => (
                                        <option key={r.id} value={`rule_${r.id}`}>{r.name}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <button
                            onClick={openRuleDetail}
                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex-shrink-0"
                            title="Xem chi tiết quy tắc này"
                        >
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Tệp đính kèm</label>
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200
              ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
            `}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".docx"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex flex-col items-center space-y-3">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-blue-100">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-base text-gray-900 font-medium">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-3">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                                    <UploadCloud className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-base text-gray-900 font-medium">Kéo thả hoặc nhấn để chọn tệp</p>
                                    <p className="text-sm text-gray-500 mt-1">Chỉ hỗ trợ tệp định dạng .docx (Microsoft Word)</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="flex items-start space-x-3 text-red-700 bg-red-50 border border-red-200 p-4 rounded-md">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`w-full py-3.5 rounded-md text-white font-semibold text-base flex justify-center items-center space-x-2 transition-all shadow-sm
              ${!file || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Đang phân tích tài liệu...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Bắt đầu đánh giá</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Rule Detail Modal */}
            {showRuleDetail && selectedRuleData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                <span>Chi tiết quy tắc: {selectedRuleData.name}</span>
                            </h3>
                            <button onClick={() => setShowRuleDetail(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {selectedRuleData.data.margin_cm && (
                                <div>
                                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Căn lề (Margin)</h4>
                                    <div className="flex space-x-6 text-sm text-gray-600">
                                        <div>Trên: <span className="font-semibold">{selectedRuleData.data.margin_cm.top} cm</span></div>
                                        <div>Dưới: <span className="font-semibold">{selectedRuleData.data.margin_cm.bottom} cm</span></div>
                                        <div>Trái: <span className="font-semibold">{selectedRuleData.data.margin_cm.left} cm</span></div>
                                        <div>Phải: <span className="font-semibold">{selectedRuleData.data.margin_cm.right} cm</span></div>
                                    </div>
                                </div>
                            )}

                            {selectedRuleData.data.page_setup && (
                                <div>
                                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Khoảng cách đoạn (Spacing)</h4>
                                    <div className="flex space-x-6 text-sm text-gray-600">
                                        <div>Cách dòng: <span className="font-semibold">{selectedRuleData.data.page_setup.line_spacing}</span></div>
                                        <div>Spacing Before: <span className="font-semibold">{selectedRuleData.data.page_setup.spacing_before} pt</span></div>
                                        <div>Spacing After: <span className="font-semibold">{selectedRuleData.data.page_setup.spacing_after} pt</span></div>
                                    </div>
                                </div>
                            )}

                            {selectedRuleData.data.styles && (
                                <div>
                                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Định dạng chữ (Styles)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderStyleItem("Normal (Văn bản thường)", selectedRuleData.data.styles["Normal"])}
                                        {renderStyleItem("Heading 1", selectedRuleData.data.styles["Heading 1"])}
                                        {renderStyleItem("Heading 2", selectedRuleData.data.styles["Heading 2"])}
                                        {renderStyleItem("Heading 3", selectedRuleData.data.styles["Heading 3"])}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-xl">
                            <button onClick={() => setShowRuleDetail(false)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadDocument;
