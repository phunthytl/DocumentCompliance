import React, { useState, useEffect } from 'react';
import { Users, FileText, Database, AlertTriangle, TrendingUp, Clock, Loader } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('https://documentcompliance.onrender.com/api/admin/stats', {
                    withCredentials: true
                });
                setStats(response.data);
            } catch (err) {
                setError("Không thể tải dữ liệu tổng quan.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan Hệ thống</h2>
                <p className="text-gray-500 mt-1">Theo dõi hoạt động và các chỉ số quan trọng của nền tảng.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tổng User</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tài liệu đã tải lên</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_documents || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mẫu tài liệu</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_templates || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Database className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Lỗi phổ biến nhất</p>
                            <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-1">{stats?.common_error || "-"}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {stats?.recent_activities?.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">Chưa có hoạt động nào.</div>
                    ) : (
                        stats?.recent_activities?.map((activity) => (
                            <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            File: <span className="text-indigo-600 font-mono text-xs ml-1 bg-indigo-50 px-1 py-0.5 rounded">{activity.filename}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">Bởi user: {activity.owner_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    {new Date(activity.uploaded_at).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
