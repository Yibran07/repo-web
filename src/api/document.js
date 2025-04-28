import axios from './axios';

export const getDocumentsRequest = () => axios.get('/documents')

export const getDocumentRequest = (id) => axios.get(`/documents/${id}`)

export const createDocumentsRequest = (document) => axios.post('/documents', document)

export const updateDocumentsRequest = (document) => axios.put(`/documents/${document.id}`, document)

export const deleteDocumentsRequest = (id) => axios.delete(`/documents/${id}`)