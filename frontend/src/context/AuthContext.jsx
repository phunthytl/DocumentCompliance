import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role') || 'user';
    if (token && email) {
      setUser({ email, role });
      // Cấu hình axios gửi kèm token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://documentcompliance.onrender.com/api/auth/login-json', {
        email,
        password
      });
      const token = response.data.access_token;
      const role = response.data.role || 'user';
      
      localStorage.setItem('token', token);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_role', role);
      
      setUser({ email, role });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true };
    } catch (error) {
      let errorMsg = 'Lỗi đăng nhập';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(e => e.msg).join(', ');
        }
      }
      return { success: false, message: errorMsg };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      await axios.post('https://documentcompliance.onrender.com/api/auth/register', {
        email,
        password,
        full_name: fullName
      });
      // Tự động đăng nhập sau khi đăng ký
      return await login(email, password);
    } catch (error) {
      let errorMsg = 'Lỗi đăng ký';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(e => e.msg).join(', ');
        }
      }
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
