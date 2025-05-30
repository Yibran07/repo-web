import axios from "./axios";

export const registerRequest = (user) => axios.post(`/auth/register`, user);
export const verifyTokenRequest = () => axios.get(`/auth/verify`);
export const loginRequest = (user) => axios.post(`/auth/login`, user);
export const logoutRequest = () => axios.post(`/auth/logout`);