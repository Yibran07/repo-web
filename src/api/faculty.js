import axios from "./axios";

export const getFacultiesRequest = () => axios.get("/faculties");

export const getFacultyRequest = (id) => axios.get(`/faculties/${id}`);

export const createFacultyRequest = (faculty) => axios.post("/faculties", faculty);

export const updateFacultyRequest = (id, faculty) => axios.put(`/faculties/${id}`, faculty);

export const deleteFacultyRequest = (id) => axios.delete(`/faculties/${id}`);