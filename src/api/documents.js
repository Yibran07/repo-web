import axios from './axios';

export const getDocumentsRequest = () => axios.get('/resources')

export const getDocumentRequest = (id) => axios.get(`/resources/${id}`)

export const createDocumentRequest = (document) => axios.post('/resources', document)

export const updateDocumentRequest = (document) => axios.put(`/resources/${document.id}`, document)

export const deleteDocumentRequest = (id) => axios.delete(`/resources/${id}`)

export const getDocumentsByUserRequest = (userId) => axios.get(`/resource-user/user/${userId}`)

export const createDocumentByUserRequest = (idUser, idResource) => axios.post(`/resource-user`, { idUser, idResource })