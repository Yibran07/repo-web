import axios from './axios';

export const registerRequest = user => axios.post(`/auth/register`, user)
export const verifyTokenRequest = () => axios.post(`/auth/verify`)
export const loginRequest = user => axios.post(`/auth/login`, user)
export const logoutRequest = () => axios.get(`/auth/logout`)
