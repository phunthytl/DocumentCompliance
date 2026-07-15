import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, FileCheck2, Loader, ArrowRight } from 'lucide-react';

const AuthForms = () => {
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            if (!fullName) {
                setError('Vui lòng nhập họ và tên');
                setLoading(false);
                return;
            }
            result = await register(email, password, fullName);
        }

        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto relative z-10">
            {/* Light Theme Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 relative overflow-hidden">

                <div className="text-center mb-8 relative z-10">
                    <div className="w-14 h-14 mx-auto bg-blue-600 rounded-lg flex items-center justify-center shadow-sm mb-6">
                        <FileCheck2 className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                        {isLogin ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Tiếp tục chuẩn hóa tài liệu cùng AI' : 'Bắt đầu hành trình chuẩn hóa của bạn'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="email@congty.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 mt-2 rounded-md text-white font-semibold text-base flex justify-center items-center space-x-2 transition-all duration-200 shadow-sm
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
                    >
                        {loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10 pt-6 border-t border-gray-100">
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForms;
