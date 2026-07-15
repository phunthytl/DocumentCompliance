import React, { useState, useEffect } from 'react';
import { FileText, Loader, ArrowRight, FilePlus2 } from 'lucide-react';
import axios from 'axios';

const TemplateGallery = ({ onTemplateUsed }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingTemplateId, setUsingTemplateId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/templates', {
                    withCredentials: true
                });
                setTemplates(response.data);
            } catch (err) {
                setError('Không thể tải danh sách mẫu.');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleUseTemplate = async (templateId) => {
        try {
            setUsingTemplateId(templateId);
            const response = await axios.post(`http://localhost:8000/api/templates/${templateId}/use`, {}, {
                withCredentials: true
            });
            
            // response.data có chứa document_id, filename, category
            // Bắn sự kiện lên App.jsx để mở DocumentEditor (hoặc chuyển sang luồng report tùy ý)
            // Hiện tại chúng ta giả định document_id được tạo dưới dạng bản nháp (draft).
            // Ta truyền reportData giả lập hoặc thông tin để mở ONLYOFFICE
            if (onTemplateUsed) {
                onTemplateUsed({
                    document_id: response.data.document_id,
                    filename: response.data.filename,
                    document_type: response.data.category,
                    // Giả lập report rỗng để truyền qua DocumentEditor
                    isTemplateDraft: true 
                });
            }
        } catch (err) {
            alert('Lỗi khi tạo tài liệu từ mẫu: ' + (err.response?.data?.detail || err.message));
        } finally {
            setUsingTemplateId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Thư viện Mẫu Tài liệu</h2>
                <p className="text-lg text-gray-500">
                    Bắt đầu nhanh chóng bằng cách chọn một mẫu đã được chuẩn hóa. Hệ thống sẽ tự động áp dụng các quy tắc kiểm duyệt phù hợp.
                </p>
            </div>

            {templates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có mẫu nào</h3>
                    <p className="text-gray-500">Vui lòng liên hệ Admin để thêm các mẫu tài liệu chuẩn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {template.category}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{template.name}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">
                                    {template.description || "Tài liệu mẫu chuẩn hóa để sử dụng ngay."}
                                </p>
                                
                                <button
                                    onClick={() => handleUseTemplate(template.id)}
                                    disabled={usingTemplateId === template.id}
                                    className="w-full flex items-center justify-center py-2.5 px-4 bg-gray-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-gray-200 hover:border-blue-600 rounded-lg text-sm font-semibold transition-all duration-300 group/btn"
                                >
                                    {usingTemplateId === template.id ? (
                                        <><Loader className="w-4 h-4 mr-2 animate-spin" /> Đang tạo...</>
                                    ) : (
                                        <>
                                            <FilePlus2 className="w-4 h-4 mr-2" />
                                            Sử dụng mẫu này
                                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateGallery;
