import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import {
    registerRequest,
    loginRequest,
    verifyTokenRequest,
} from "../api/auth";

export const AuthContext = createContext();

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signup = async (data) => {
        try {
            const res = await registerRequest(data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg =
                err.response?.data?.message || "Error en el registro";
            setErrors([{ message: msg }]);
            return { success: false, error: err };
        }
    };

    const signin = async (credentials) => {
        try {
            const res = await loginRequest(credentials);
            console.log("Cookies tras login:", Cookies.get());
            setUser(res.data.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            const msg =
                err.response?.data?.message || "Error en el inicio de sesión";
            setErrors([{ message: msg }]);
            return { success: false, error: err };
        }
    };

    const logout = () => {
        Cookies.remove("token");
        setUser(null);
        setIsAuthenticated(false);
    };

    // Limpia errores tras 5s
    useEffect(() => {
        if (errors.length === 0) return;
        const id = setTimeout(() => setErrors([]), 5000);
        return () => clearTimeout(id);
    }, [errors]);

    // Al montar, comprueba cookie + token válido
    useEffect(() => {
        (async () => {
            const token = Cookies.get("token");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await verifyTokenRequest();
                setUser(res.data.user);
                setIsAuthenticated(true);
            } catch {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                signup,
                signin,
                logout,
                user,
                isAuthenticated,
                errors,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};