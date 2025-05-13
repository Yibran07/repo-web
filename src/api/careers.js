import axios from './axios'

export const getCareersRequest = () => axios.get('/careers')

export const getCareerRequest = (id) => axios.get(`/careers/${id}`)

export const createCareerRequest = (career) => axios.post('/careers', career)

export const updateCareerRequest = (id, career) => axios.put(`/careers/${id}`, career)

export const deleteCareerRequest = (id) => axios.delete(`/careers/${id}`)
