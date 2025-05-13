import { createContext, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';

import { registerRequest, loginRequest, verifyTokenRequest } from '../api/auth';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(true)

    const singup = async (user) => {
        try{
            const res = await registerRequest(user);
            return {
                success: true,
                data: res.data
            }
        }catch(err){
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setErrors([{ message: err.response.data.message }]);
            } else {
                setErrors([{ message: "Error en el registro" }]);
            }
            return {
                success: false,
                error: err
            }
        }
    }

    const signin = async (user) => {
        try{
            const res = await loginRequest(user);
            setUser(res.data); 
            setIsAuthenticated(true);
        }catch(err){
            if (err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response.data.message) {
                setErrors([{ message: err.response.data.message }]);
            } else {
                setErrors([{ message: "Error en el inicio de sesión" }]);
            }
        }
    }

    const logout = () => {
        Cookies.remove('token')
        setUser(null)
        setIsAuthenticated(false)
    }

    useEffect(() => {
        if(errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [errors])

    useEffect(() => {
        const checkLogin = async () => {
            const cookies = Cookies.get()
            if(!cookies.token) {
                setIsAuthenticated(false)
                setLoading(false)
                return setUser(null)
            }
            try{
                const res = await verifyTokenRequest(cookies.token)
                if(!res.data){
                    setIsAuthenticated(false)
                    setLoading(false)
                    return
                }
                setIsAuthenticated(true)
                setUser(res.data)
                setLoading(false)
            }catch(err){
                console.error(err)
                setIsAuthenticated(false)
                setUser(null)
                setLoading(false)
            }
        }
        checkLogin()
    }, [])

    return (
        <AuthContext.Provider value={{singup, signin, logout, user, isAuthenticated, errors, loading}}>
            {children}
        </AuthContext.Provider>
    )
}