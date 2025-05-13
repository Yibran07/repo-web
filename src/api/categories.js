import axios from './axios'

export const getCategoriesRequest = () => axios.get('/categories')

export const getCategorieRequest = (id) => axios.get(`/categories/${id}}`)

export const createCategoryRequest = (category) => axios.post('/categories', category)

export const updateCategoryRequest = (id, category) => axios.put(`/categories/${id}`, category)

export const deleteCategoryRequest = (id) => axios.delete(`/categories/${id}`)