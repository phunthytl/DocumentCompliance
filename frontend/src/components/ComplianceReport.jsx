import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, Edit3, Wrench, Download } from 'lucide-react';

const ComplianceReport = ({ data, onBack, onEdit }) => {
    const { report, filename, document_id } = data;
    const scoreColor = report.score >= 90 ? 'text-green-600' : report.score >= 70 ? 'text-yellow-600' : 'text-red-600';

    // State để lưu các nhóm lỗi đã được người dùng chọn để fix
    const [selectedFixes, setSelectedFixes] = useState({});
    const [fixing, setFixing] = useState(false);
    const [fixMessage, setFixMessage] = useState('');

    // Nhóm các lỗi giống nhau theo message
    const groupedErrors = React.useMemo(() => {
        if (!report.errors) return [];

        const groups = {};
        report.errors.forEach((err, idx) => {
            const msg = typeof err === 'string' ? err : err.message;
            const groupId = msg; // Dùng thông điệp lỗi làm ID nhóm

            if (!groups[groupId]) {
                groups[groupId] = {
                    id: groupId,
                    message: msg,
                    count: 0,
                    fixes: []
                };
            }

            groups[groupId].count++;
            if (err.fix_data) {
                groups[groupId].fixes.push({
                    ...err.fix_data,
                    id: err.id || `fix_${idx}`,
                    type: err.type || 'format'
                });
            }
        });

        return Object.values(groups);
    }, [report.errors]);

    const toggleFix = (group) => {
        if (group.fixes.length === 0) return;
        setSelectedFixes(prev => {
            const next = { ...prev };
            if (next[group.id]) delete next[group.id];
            else next[group.id] = group.fixes;
            return next;
        });
    };

    const selectAllFixes = () => {
        const allFixes = {};
        groupedErrors.forEach(group => {
            if (group.fixes && group.fixes.length > 0) {
                allFixes[group.id] = group.fixes;
            }
        });
        setSelectedFixes(allFixes);
    };

    const handleApplyFixes = async () => {
        const fixesToApply = Object.values(selectedFixes).flat();
        if (fixesToApply.length === 0) return;

        setFixing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`https://documentcompliance.onrender.com/api/documents/fix/${document_id}`,
                { fixes: fixesToApply },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setFixMessage('Đã tự động sửa các lỗi thành công! Bạn có thể tải hoặc xem lại file.');
            // Xóa selection sau khi sửa
            setSelectedFixes({});
        } catch (err) {
            setFixMessage('Có lỗi xảy ra khi sửa file: ' + (err.response?.data?.detail || err.message));
        }
        setFixing(false);
    };

    return (
        <div className="w-full max-w-4xl flex flex-col">
            <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Báo cáo tuân thủ</h2>
                    <div className="flex items-center space-x-2">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium border border-gray-200">
                            {filename}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Điểm số</p>
                    <div className={`text-5xl font-black ${scoreColor}`}>
                        {report.score}<span className="text-2xl text-gray-400">/100</span>
                    </div>
                </div>
            </div>

            {fixMessage && (
                <div className={`mb-6 p-5 rounded-md border flex flex-col space-y-3 ${fixMessage.includes('thành công') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`font-medium ${fixMessage.includes('thành công') ? 'text-green-800' : 'text-red-800'}`}>
                        {fixMessage}
                    </div>
                    {fixMessage.includes('thành công') && (
                        <div className="flex items-center space-x-3 pt-2">
                            <a
                                href={`https://documentcompliance.onrender.com/api/documents/download/${document_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md flex items-center space-x-2 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                <span>Tải file đã sửa</span>
                            </a>
                            <button
                                onClick={onEdit}
                                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold rounded-md flex items-center space-x-2 transition-colors shadow-sm"
                            >
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                <span>Xem trên ONLYOFFICE</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span>Lỗi Định Dạng ({report.errors?.length || 0})</span>
                        </h3>
                        <div className="flex space-x-3">
                            <button
                                onClick={selectAllFixes}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-md transition-colors shadow-sm"
                            >
                                Chọn tất cả
                            </button>
                            {Object.keys(selectedFixes).length > 0 && (
                                <button
                                    onClick={handleApplyFixes}
                                    disabled={fixing}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md flex items-center space-x-2 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    <Wrench className="w-4 h-4" />
                                    <span>{fixing ? 'Đang xử lý...' : `Áp dụng sửa ${Object.values(selectedFixes).flat().length} lỗi`}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {groupedErrors.length > 0 ? (
                        <ul className="space-y-3">
                            {groupedErrors.map((group, idx) => {
                                const hasFix = group.fixes.length > 0;
                                const isSelected = selectedFixes[group.id];

                                return (
                                    <li key={idx} className={`flex items-center justify-between p-4 rounded-md border transition-all ${isSelected ? 'bg-green-50 border-green-200' : 'bg-white border-red-200'}`}>
                                        <div className="flex items-start space-x-3 text-gray-800 flex-1 pr-4">
                                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm leading-relaxed">{group.message}</span>
                                                {group.count > 1 && (
                                                    <span className="text-xs text-red-500 font-semibold mt-1 bg-red-100 inline-block px-2 py-0.5 rounded-full w-max">
                                                        Lặp lại {group.count} lần
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {hasFix && (
                                            <button
                                                onClick={() => toggleFix(group)}
                                                className={`flex-shrink-0 ml-4 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${isSelected ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {isSelected ? 'Đã chọn sửa' : `Sửa tất cả (${group.fixes.length})`}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex items-center space-x-3 text-green-700 bg-green-50 border border-green-200 p-4 rounded-md">
                            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                            <span className="font-medium">Tài liệu không có lỗi định dạng nào. Rất tuyệt vời!</span>
                        </div>
                    )}
                </section>

                {report.warnings?.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <span>Cảnh báo ({report.warnings.length})</span>
                        </h3>
                        <ul className="space-y-3">
                            {report.warnings.map((warn, idx) => (
                                <li key={idx} className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                                    <span className="font-medium text-sm">{warn}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-semibold text-sm flex items-center space-x-2 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kiểm tra file khác</span>
                </button>

                <button
                    onClick={onEdit}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md flex items-center space-x-2 transition-colors shadow-sm"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>Sửa tài liệu ngay (ONLYOFFICE)</span>
                </button>
            </div>
        </div>
    );
};

export default ComplianceReport;
