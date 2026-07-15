import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Database, 
    Settings, 
    Users, 
    LogOut, 
    ArrowLeft,
    ShieldAlert
} from 'lucide-react';

const AdminLayout = ({ children, activeTab, setActiveTab, onExitAdmin }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 w-full flex font-sans overflow-hidden">
            {/* Dark Sidebar cho Admin */}
            <div className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 text-gray-300">
                <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-sm bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        <ShieldAlert className="text-white w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Tổng quan</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Database className="w-5 h-5" />
                        <span>Quản lý Mẫu</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'rules' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span>Thiết lập Rule (Global)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Người dùng</span>
                    </button>
                </nav>

                {/* Back to User mode & Logout */}
                <div className="p-4 border-t border-gray-800 space-y-2">
                    <button 
                        onClick={onExitAdmin} 
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Về giao diện User</span>
                    </button>
                    
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-3 truncate">
                            <div className="w-8 h-8 rounded-sm bg-gray-800 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-gray-700">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-400 text-sm font-medium truncate">{user.email.split('@')[0]}</span>
                        </div>
                        <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Đăng xuất">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-gray-50">
                <div className="flex-1 w-full p-8 lg:p-12 relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
