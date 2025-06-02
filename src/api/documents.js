import axios from "./axios";

/* ────────────────────────────── GETs ───────────────────────────── */

export const getDocumentsRequest = (includeFile = false) =>
  axios.get("/resources", { params: { includeFile } });

export const getDocumentRequest = (id, includeFile = false) =>
  axios.get(`/resources/${id}`, { params: { includeFile } });

export const getDocumentsByUserRequest = (userId, includeFile = false) =>
  axios.get(`/resource-user/user/${userId}`, { params: { includeFile } });

export const getDocumentsUserRequest = () => axios.get(`/resource-user/`);

/* ───────────────────────────── CREATE ──────────────────────────── */
//  'document' debe ser un objeto con las keys del body (title, …)
//  y dos prop. file   : File | Blob  (archivo principal)
//                   image : File | Blob  (portada PNG/JPG/JPEG)
export const createDocumentRequest = async (document) => {
  const fd = new FormData();

  if (document.title !== undefined) fd.append("title", document.title);
  if (document.description !== undefined)
    fd.append("description", document.description);
  if (document.datePublication !== undefined)
    fd.append("datePublication", document.datePublication);
  if (document.isActive !== undefined) fd.append("isActive", document.isActive);
  if (document.idStudent !== undefined)
    fd.append("idStudent", document.idStudent);
  if (document.idCategory !== undefined)
    fd.append("idCategory", document.idCategory);

  if (document.file) {
    fd.append("file", document.file);
  }

  if (document.image) {
    fd.append("image", document.image);
  }

  const headers = {
    "Content-Type": "multipart/form-data",
  };

  try {
    const response = await axios.post("/resources", fd, { headers });
    return response;
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    throw error;
  }
};

/* ───────────────────────────── UPDATE ──────────────────────────── */
//  Para actualizar, si quieres permitir cambiar archivos pasa los nuevos
//  en 'file' y/o 'image'; si no, omítalos y sólo enviará JSON.
export const updateDocumentRequest = async (id, data) => {
  const hasFile = !!data.file;
  const hasImage = !!data.image;

  if (hasFile || hasImage) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k !== "file" && k !== "image") fd.append(k, String(v));
    });
    if (hasFile) fd.append("file", data.file);
    if (hasImage) fd.append("image", data.image);
    return axios.put(`/resources/${id}`, fd);
  }

  return axios.put(`/resources/${id}`, data);
};

/* ───────────────────────────── PATCH ──────────────────────────── */

// PATCH /resources/:id/disable
export const disableDocumentRequest = (id) =>
  axios.patch(`/resources/${id}/disable`);

// PATCH /resources/:id/enable
export const enableDocumentRequest = (id) =>
  axios.patch(`/resources/${id}/enable`);

/* ──────────────────── vincular recurso ⇄ usuario ───────────────── */

export const createDocumentByUserRequest = (idUser, idResource) =>
  axios.post(`/resource-user`, { idUser, idResource });
