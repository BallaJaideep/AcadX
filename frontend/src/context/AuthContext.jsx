import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem("elor_user");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("AuthContext: Failed to parse elor_user from localStorage", err);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("elor_token"));
  const [loading, setLoading] = useState(false);

  /* =========================
     Sync Axios Auth Header
  ========================= */
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    const refreshUser = async () => {
      if (!token) return;

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        // silently ignore
      }
    };

    refreshUser();
  }, [token]);

  /* =========================
     Persistent User Setter
  ========================= */
  const setUser = (updatedUser) => {
    setUserState(updatedUser);
    localStorage.setItem("elor_user", JSON.stringify(updatedUser));
  };

  const saveAuth = (tokenValue, userValue) => {
    if (tokenValue) {
      setToken(tokenValue);
      localStorage.setItem("elor_token", tokenValue);
    }
    if (userValue) {
      setUser(userValue);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("elor_token");
    localStorage.removeItem("elor_user");
    setToken(null);
    setUserState(null);
    delete api.defaults.headers.common.Authorization;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      saveAuth(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", userData);
      saveAuth(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => clearAuth();

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token,
        setUser,
      }}
    >
      {console.log("AuthContext: Providing values", { isAuthenticated: !!token, hasUser: !!user })}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
