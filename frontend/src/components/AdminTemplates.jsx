import React, { useState, useEffect } from 'react';
import { Upload, FileText, Plus, Loader, AlertCircle, CheckCircle2, Search, Trash2, Edit } from 'lucide-react';
import axios from 'axios';

const AdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('business');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const openUploadModal = (template = null) => {
        if (template) {
            setEditingId(template.id);
            setName(template.name);
            setDescription(template.description || '');
            setCategory(template.category || 'business');
            setFile(null); // Không bắt buộc sửa file
        } else {
            setEditingId(null);
            setName('');
            setDescription('');
            setCategory('business');
            setFile(null);
        }
        setError(null);
        setIsUploadModalOpen(true);
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://documentcompliance.onrender.com/api/templates', {
                withCredentials: true
            });
            setTemplates(response.data);
        } catch (err) {
            setError('Không thể tải danh sách mẫu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!editingId && !file) {
            setError('Vui lòng chọn file mẫu (chỉ dành cho thêm mới).');
            return;
        }
        
        if (!name) {
            setError('Vui lòng nhập tên mẫu.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);

            if (editingId) {
                // Sửa thông tin mẫu
                await axios.put(`https://documentcompliance.onrender.com/api/templates/${editingId}`, {
                    name, description, category
                }, {
                    withCredentials: true
                });
                setSuccess('Cập nhật mẫu thành công!');
            } else {
                // Thêm mới mẫu (cần file)
                const formData = new FormData();
                formData.append('file', file);
                formData.append('name', name);
                formData.append('description', description);
                formData.append('category', category);

                await axios.post('https://documentcompliance.onrender.com/api/templates/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
                setSuccess('Upload mẫu thành công!');
            }

            setSuccess('Upload mẫu thành công!');
            // Reset form
            setFile(null);
            setName('');
            setDescription('');
            setIsUploadModalOpen(false);
            
            // Reload list
            fetchTemplates();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Lỗi khi upload mẫu');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa mẫu tài liệu này? Không thể khôi phục file sau khi xóa.")) return;
        try {
            await axios.delete(`https://documentcompliance.onrender.com/api/templates/${id}`, {
                withCredentials: true
            });
            setSuccess('Đã xóa mẫu thành công!');
            fetchTemplates();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            alert(err.response?.data?.detail || "Lỗi khi xóa mẫu");
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Mẫu Tài Liệu</h2>
                    <p className="text-gray-500 mt-1">Danh sách các tài liệu mẫu chuẩn hóa cho toàn hệ thống.</p>
                </div>
                <button 
                    onClick={() => openUploadModal()}
                    className="flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Thêm Mẫu Mới
                </button>
            </div>

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                    <span className="font-medium">{success}</span>
                </div>
            )}

            {/* Table Area */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm mẫu tài liệu..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Tổng cộng: {filteredTemplates.length} mẫu
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Tên Mẫu</th>
                                <th className="px-6 py-4">Phân Loại</th>
                                <th className="px-6 py-4">Mô Tả</th>
                                <th className="px-6 py-4">File Vật Lý</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredTemplates.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>Không tìm thấy mẫu tài liệu nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">{template.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                                                {template.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs" title={template.description}>
                                                {template.description || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                                                {template.filename}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openUploadModal(template)} className="text-indigo-600 hover:text-indigo-900 mx-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(template.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal (Slide over or simple absolute modal) */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsUploadModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                        </div>

                        <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <h3 className="text-xl font-bold leading-6 text-gray-900 mb-4">{editingId ? "Cập nhật Mẫu" : "Thêm Mẫu Mới"}</h3>
                            
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start">
                                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên mẫu *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Hợp đồng lao động chuẩn"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="business">Thương mại / Kinh doanh (Business)</option>
                                        <option value="academic">Học thuật (Academic)</option>
                                        <option value="contract">Hợp đồng (Contract)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mô tả ngắn gọn..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {(!editingId) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">File mẫu (.docx) *</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors bg-gray-50">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center mt-2">
                                                    <label htmlFor="templateFile" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 px-3 py-1 shadow-sm border border-gray-200">
                                                        <span>Chọn file</span>
                                                        <input id="templateFile" name="templateFile" type="file" accept=".docx" className="sr-only" onChange={(e) => setFile(e.target.files[0])} required={!editingId} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                                    {file ? file.name : "Chỉ hỗ trợ .docx (Max 10MB)"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-70"
                                    >
                                        {uploading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        {uploading ? 'Đang tải lên...' : 'Xác nhận Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTemplates;
