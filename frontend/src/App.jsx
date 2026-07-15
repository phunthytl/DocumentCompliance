import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AuthForms from './components/AuthForms';
import UploadDocument from './components/UploadDocument';
import ComplianceReport from './components/ComplianceReport';
import RuleBuilder from './components/RuleBuilder';
import DocumentEditor from './components/DocumentEditor';
import AIAnalysis from './components/AIAnalysis';
import TemplateGallery from './components/TemplateGallery';
import AdminTemplates from './components/AdminTemplates';
import AdminDashboard from './components/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import AdminUsers from './components/AdminUsers';
import { Settings, FileCheck2, LogOut, Loader, LayoutDashboard, BrainCircuit, Library, ShieldAlert } from 'lucide-react';

function App() {
    const { user, loading, logout } = useContext(AuthContext);
    const [reportData, setReportData] = useState(null);

    // Navigation States
    const [activeTab, setActiveTab] = useState('workspace'); // workspace | ai_analysis | templates | rules
    const [adminTab, setAdminTab] = useState('dashboard'); // dashboard | templates | rules
    const [showEditor, setShowEditor] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    // --- Bố cục CHƯA đăng nhập ---
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 w-full flex font-sans overflow-hidden">
                <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gray-900 border-r border-gray-800 p-12 relative overflow-hidden">
                    <div className="relative z-10 text-white">
                        <div className="flex items-center space-x-3 mb-16">
                            <div className="w-10 h-10 rounded-sm bg-blue-600 flex items-center justify-center shadow-sm">
                                <FileCheck2 className="text-white w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">DocCompliance AI</span>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Chuẩn hóa<br />
                            <span className="text-blue-400">Tài liệu</span><br />
                            trong nháy mắt.
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-sm mb-12">
                            Hệ thống phân tích và kiểm tra định dạng tài liệu tự động sử dụng AI.
                        </p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
                    <div className="w-full max-w-md">
                        <AuthForms />
                    </div>
                </div>
            </div>
        );
    }

    // --- Bố cục ADMIN MODE ---
    if (isAdminMode && user.role === 'admin') {
        return (
            <AdminLayout 
                activeTab={adminTab} 
                setActiveTab={setAdminTab} 
                onExitAdmin={() => setIsAdminMode(false)}
            >
                {adminTab === 'dashboard' ? (
                    <AdminDashboard />
                ) : adminTab === 'templates' ? (
                    <AdminTemplates />
                ) : adminTab === 'rules' ? (
                    <RuleBuilder onBack={() => {}} isAdminMode={true} />
                ) : adminTab === 'users' ? (
                    <AdminUsers />
                ) : (
                    <AdminDashboard />
                )}
            </AdminLayout>
        );
    }

    // --- Bố cục USER MODE (Default) ---
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 w-full flex font-sans overflow-hidden">
            {/* Sidebar thanh lịch */}
            <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-sm bg-blue-600 flex items-center justify-center">
                        <FileCheck2 className="text-white w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-gray-900">DocCompliance</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('workspace'); setShowEditor(false); }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'workspace' && !showEditor ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Kiểm tra định dạng</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('ai_analysis'); setShowEditor(false); }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'ai_analysis' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <BrainCircuit className="w-5 h-5" />
                        <span>Đánh giá nội dung (AI)</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('templates'); setShowEditor(false); }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Library className="w-5 h-5" />
                        <span>Thư viện mẫu</span>
                    </button>

                    {/* Tạm thời để lại Thiết lập rule cho user nếu họ có quyền custom rules cá nhân, 
                        hoặc có thể ẩn đi tuỳ business logic. Hiện tại vẫn giữ. */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={() => { setActiveTab('rules'); setShowEditor(false); }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'rules' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Thiết lập rule cá nhân</span>
                        </button>
                    </div>
                </nav>

                {/* User Info & Admin Switcher */}
                <div className="p-4 border-t border-gray-100 space-y-3">
                    {user.role === 'admin' && (
                        <button 
                            onClick={() => setIsAdminMode(true)}
                            className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                            <ShieldAlert className="w-4 h-4 text-indigo-400" />
                            <span>Trang Quản trị (Admin)</span>
                        </button>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 truncate">
                            <div className="w-8 h-8 rounded-sm bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center space-x-2 truncate">
                                <span className="text-gray-700 text-sm font-medium truncate">{user.email.split('@')[0]}</span>
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Đăng xuất">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-white">
                <div className="flex-1 w-full p-8 lg:p-12 relative z-10">
                    {showEditor ? (
                        <DocumentEditor documentData={reportData} onBack={() => setShowEditor(false)} />
                    ) : activeTab === 'rules' ? (
                        <RuleBuilder onBack={() => setActiveTab('workspace')} />
                    ) : activeTab === 'ai_analysis' ? (
                        <AIAnalysis />
                    ) : activeTab === 'templates' ? (
                        <TemplateGallery onTemplateUsed={(data) => {
                            setReportData(data);
                            setShowEditor(true);
                        }} />
                    ) : reportData ? (
                        <ComplianceReport data={reportData} onBack={() => setReportData(null)} onEdit={() => setShowEditor(true)} />
                    ) : (
                        <UploadDocument onReportReceived={(data) => setReportData(data)} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
