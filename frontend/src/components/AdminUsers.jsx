import React, { useState, useEffect } from 'react';
import { Users, Loader, AlertCircle, CheckCircle2, Search, Shield, UserX, UserCheck } from 'lucide-react';
import axios from 'axios';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/users', {
                withCredentials: true
            });
            setUsers(response.data);
        } catch (err) {
            setError('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Bạn có chắc muốn cấp quyền ${newRole.toUpperCase()} cho user này?`)) return;
        try {
            const res = await axios.put(`http://localhost:8000/api/users/${userId}/role`, { role: newRole }, {
                withCredentials: true
            });
            setSuccess(res.data.message);
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            alert(err.response?.data?.detail || "Lỗi khi đổi quyền");
        }
    };

    const handleToggleStatus = async (userId) => {
        if (!window.confirm(`Bạn có chắc muốn thay đổi trạng thái của user này?`)) return;
        try {
            const res = await axios.put(`http://localhost:8000/api/users/${userId}/toggle-status`, {}, {
                withCredentials: true
            });
            setSuccess(res.data.message);
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            alert(err.response?.data?.detail || "Lỗi khi đổi trạng thái");
        }
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Người dùng</h2>
                    <p className="text-gray-500 mt-1">Quản lý tài khoản, phân quyền và trạng thái hoạt động.</p>
                </div>
            </div>

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                    <span className="font-medium">{success}</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm email hoặc tên..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Tổng cộng: {filteredUsers.length} users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">Ngày Đăng Ký</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Vai trò (Role)</th>
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
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>Không tìm thấy người dùng nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mr-3 font-bold text-sm">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{user.full_name || "User"}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.is_active ? 'Hoạt động' : 'Bị Khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500
                                                    ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                                    user.role === 'vip' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                                            >
                                                <option value="user">USER</option>
                                                <option value="vip">VIP</option>
                                                <option value="admin">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`p-1.5 rounded-md transition-colors ${user.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={user.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                            >
                                                {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
