import React, { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, UploadCloud, FileText, CheckCircle, AlertCircle, Loader, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAnalysis = () => {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('academic');
    const [customPrompt, setCustomPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
        }
    };

    const [showVipModal, setShowVipModal] = useState(false);

    const handleAnalyze = async () => {
        if (!file) {
            setError('Vui lòng chọn một tệp .docx hoặc .txt');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);
        if (customPrompt.trim()) {
            formData.append('custom_prompt', customPrompt);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/ai/analyze-content', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setResult(response.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setShowVipModal(true);
            } else {
                setError(err.response?.data?.detail || 'Có lỗi xảy ra khi phân tích bằng AI.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMakeVip = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/auth/make-vip', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            localStorage.setItem('user_role', 'vip'); // Cập nhật role local
            setShowVipModal(false);
            alert('Tài khoản đã được nâng cấp lên VIP! Bạn có thể nhấn Phân tích lại.');
            window.location.reload(); // Reload để nhận giao diện VIP
        } catch (err) {
            alert('Lỗi khi nâng cấp VIP');
        }
    };

    const renderScoreBar = (score) => {
        let colorClass = "bg-red-500";
        if (score >= 70) colorClass = "bg-yellow-400";
        if (score >= 85) colorClass = "bg-green-500";

        return (
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 mt-4 relative overflow-hidden">
                <div className={`h-3 rounded-full ${colorClass} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col">
            <div className="mb-8 border-b border-gray-200 pb-6 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Đánh giá Nội dung</h2>
                    <p className="text-gray-500 mt-1 text-base">Tải lên Báo cáo/Khóa luận để AI đọc và phân tích cấu trúc, văn phong, lỗi logic.</p>
                </div>
            </div>

            {!result ? (
                <div className="space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Tệp tài liệu cần phân tích</label>
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200
                ${file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
              `}
                            onClick={() => document.getElementById('ai-file-upload').click()}
                        >
                            <input id="ai-file-upload" type="file" className="hidden" accept=".docx,.txt" onChange={handleFileChange} />

                            {file ? (
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-indigo-100">
                                        <FileText className="w-6 h-6 text-indigo-600" />
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
                                        <p className="text-sm text-gray-500 mt-1">Hỗ trợ định dạng .docx, .txt</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span>Loại tài liệu & Bộ quy tắc nội dung</span>
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        >
                            <option value="academic">Tài liệu học thuật (Khách quan, trung lập)</option>
                            <option value="business">Tài liệu doanh nghiệp (Trang trọng, ngắn gọn)</option>
                            <option value="contract">Hợp đồng / Pháp lý (Chặt chẽ, chính xác)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span>Yêu cầu cụ thể cho AI (Tùy chọn)</span>
                        </label>
                        <textarea
                            rows="3"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Ví dụ: Tập trung kiểm tra lỗi logic ở phần kết luận, hay tìm các câu văn lủng củng..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                        ></textarea>
                    </div>

                    {error && (
                        <div className="flex items-start space-x-3 text-red-700 bg-red-50 border border-red-200 p-4 rounded-md">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className={`w-full py-3.5 rounded-md text-white font-semibold text-base flex justify-center items-center space-x-2 transition-all shadow-sm
                ${!file || loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Đang phân tích sâu bằng Gemini AI... (Mất khoảng 10-20 giây)</span>
                                </>
                            ) : (
                                <>
                                    <BrainCircuit className="w-5 h-5" />
                                    <span>Bắt đầu Phân tích Nội dung</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">Kết quả Đánh giá Nội dung</h3>
                        <button
                            onClick={() => { setResult(null); setFile(null); setCustomPrompt(''); setDocumentType('academic'); }}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Phân tích tài liệu khác
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8 relative overflow-hidden">
                        {/* Điểm số */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Điểm chất lượng nội dung</span>
                            <div className="text-6xl font-extrabold text-gray-900 tracking-tighter">
                                {result.overall_score}<span className="text-2xl text-gray-400 font-medium tracking-normal">/100</span>
                            </div>
                            <div className="w-full max-w-md mt-4">
                                {renderScoreBar(result.overall_score)}
                            </div>
                        </div>

                        {/* Tóm tắt */}
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <span>Tóm tắt Nội dung</span>
                            </h4>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{result.summary}</p>
                        </div>

                        {/* Điểm mạnh & Điểm yếu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                <h4 className="text-green-800 font-bold mb-4 flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Điểm sáng (Strengths)</span>
                                </h4>
                                <ul className="space-y-2">
                                    {result.strengths?.map((item, idx) => (
                                        <li key={idx} className="flex items-start space-x-2 text-green-700 text-sm">
                                            <span className="mt-1 flex-shrink-0 text-green-500">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                <h4 className="text-red-800 font-bold mb-4 flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Cần cải thiện (Weaknesses)</span>
                                </h4>
                                <ul className="space-y-2">
                                    {result.weaknesses?.map((item, idx) => (
                                        <li key={idx} className="flex items-start space-x-2 text-red-700 text-sm">
                                            <span className="mt-1 flex-shrink-0 text-red-500">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Chi tiết bằng Markdown */}
                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                                <span>Phân tích Chuyên sâu từ AI</span>
                            </h4>
                            <div className="prose prose-indigo max-w-none prose-sm sm:prose-base text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <ReactMarkdown>{result.detailed_feedback}</ReactMarkdown>
                            </div>
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
                            Phân tích sâu nội dung bằng AI là tính năng độc quyền dành cho thành viên VIP. Nâng cấp ngay để mở khóa sức mạnh trí tuệ nhân tạo!
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

export default AIAnalysis;
