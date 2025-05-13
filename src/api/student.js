import axios from './axios';

export const getStudentsRequest = () => axios.get('/students');

export const getStudentRequest = (id) => axios.get(`/students/${id}`);

export const createStudentRequest = (student) => axios.post('/students', student);

export const updateStudentRequest = (id, student) => axios.put(`/students/${id}`, student); 

export const deleteStudentRequest = (id) => axios.delete(`/students/${id}`);