import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { api } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Demo default user: Citizen Anandan Selvaraj
  const [token, setToken] = useState(() => localStorage.getItem('bharat_token') || 'demo_token_citizen_1');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bharat_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 1,
      full_name: 'Anandan Selvaraj',
      email: 'citizen@bharatgas.gov.in',
      mobile_number: '9876543210',
      role: 'citizen',
      language: 'en',
      state: 'Tamil Nadu',
      district: 'Chennai',
    };
  });

  const [lang, setLang] = useState(() => localStorage.getItem('bharat_lang') || 'en');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Sync token & user to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('bharat_token', token);
    } else {
      localStorage.removeItem('bharat_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bharat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bharat_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bharat_lang', lang);
  }, [lang]);

  // Translation helper
  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newUser.language) {
      setLang(newUser.language);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bharat_token');
    localStorage.removeItem('bharat_user');
  };

  // Switch demo account instantly for effortless evaluation
  const switchDemoUser = (role) => {
    if (role === 'admin') {
      const adminUser = {
        id: 2,
        full_name: 'Officer Rajesh Kumar (LPG Admin)',
        email: 'admin@bharatgas.gov.in',
        mobile_number: '9876500000',
        role: 'admin',
        language: lang,
        state: 'Tamil Nadu',
        district: 'Chennai',
      };
      setToken('demo_token_admin_2');
      setUser(adminUser);
    } else {
      const citizenUser = {
        id: 1,
        full_name: 'Anandan Selvaraj',
        email: 'citizen@bharatgas.gov.in',
        mobile_number: '9876543210',
        role: 'citizen',
        language: lang,
        state: 'Tamil Nadu',
        district: 'Chennai',
      };
      setToken('demo_token_citizen_1');
      setUser(citizenUser);
    }
  };

  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadNotifsCount(res.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background notification fetch error
    }
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [token, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        lang,
        setLang,
        t,
        login,
        logout,
        switchDemoUser,
        notifications,
        unreadNotifsCount,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
