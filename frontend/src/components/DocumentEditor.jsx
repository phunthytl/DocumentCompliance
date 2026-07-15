import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const DocumentEditor = ({ documentData, onBack }) => {
    const editorContainerRef = useRef(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Tải script API của ONLYOFFICE từ server
        const scriptUrl = 'http://localhost:8080/web-apps/apps/api/documents/api.js';

        // Nếu DocsAPI đã sẵn sàng
        if (window.DocsAPI) {
            setScriptLoaded(true);
            return;
        }

        // Nếu script đang tải, thêm event listener
        let script = document.querySelector(`script[src="${scriptUrl}"]`);
        if (!script) {
            script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);
        }

        const handleLoad = () => setScriptLoaded(true);
        const handleError = () => setError('Không thể kết nối đến ONLYOFFICE Server (localhost:8080). Hãy chắc chắn Docker đang chạy.');

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        return () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
        };
    }, []);

    const editorInstanceRef = useRef(null);

    useEffect(() => {
        if (scriptLoaded && window.DocsAPI) {
            // Dọn dẹp editor cũ nếu có (Fix lỗi React Strict Mode)
            if (editorInstanceRef.current && editorInstanceRef.current.destroyEditor) {
                editorInstanceRef.current.destroyEditor();
                editorInstanceRef.current = null;
            }

            // Dùng document_id thay vì filename để Backend tự map với tên file thực tế (an toàn)
            const documentUrl = `http://host.docker.internal:8000/api/documents/download/${documentData.document_id}`;
            const callbackUrl = `http://host.docker.internal:8000/api/documents/callback/${documentData.document_id}`;

            const config = {
                document: {
                    fileType: 'docx',
                    key: `${documentData.document_id}_${Date.now()}`, // Khóa duy nhất cho mỗi phiên
                    title: documentData.filename,
                    url: documentUrl,
                },
                documentType: 'word',
                editorConfig: {
                    callbackUrl: callbackUrl,
                    mode: 'edit',
                    lang: 'vi-VN',
                    customization: {
                        forcesave: true, // Cho phép lưu ngay lập tức
                    }
                },
                height: '100%',
                width: '100%',
            };

            try {
                editorInstanceRef.current = new window.DocsAPI.DocEditor("onlyoffice-editor-placeholder", config);
            } catch (err) {
                setError('Lỗi khi khởi tạo ONLYOFFICE Editor.');
                console.error(err);
            }
        }

        return () => {
            if (editorInstanceRef.current && editorInstanceRef.current.destroyEditor) {
                editorInstanceRef.current.destroyEditor();
                editorInstanceRef.current = null;
            }
        };
    }, [scriptLoaded, documentData]);

    return (
        <div className="w-full h-[calc(100vh-6rem)] bg-white relative flex flex-col">
            <div className="bg-white border-b border-gray-200 text-gray-900 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium text-sm">Quay lại Báo cáo</span>
                    </button>
                    <div className="h-4 border-l border-gray-300"></div>
                    <span className="font-semibold text-sm">{documentData.filename}</span>
                </div>
            </div>

            {error ? (
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-md text-center max-w-lg">
                        <h3 className="text-lg font-bold mb-2">Lỗi Kết Nối</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 w-full bg-gray-100 relative">
                    {!scriptLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-medium">
                            Đang tải ONLYOFFICE Editor...
                        </div>
                    )}
                    {/* Container cho ONLYOFFICE. Không chứa phần tử con React để tránh bị React ghi đè DOM */}
                    <div id="onlyoffice-editor-placeholder" className="w-full h-full"></div>
                </div>
            )}
        </div>
    );
};

export default DocumentEditor;
