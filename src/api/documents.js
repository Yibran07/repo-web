import axios from './axios';

/* ────────────────────────────── GETs ───────────────────────────── */

export const getDocumentsRequest = (includeFile = false) =>
  axios.get("/resources", { params: { includeFile } });

export const getDocumentRequest = (id, includeFile = false) =>
  axios.get(`/resources/${id}`, { params: { includeFile } });

export const getDocumentsByUserRequest = (userId, includeFile = false) =>
  axios.get(`/resource-user/user/${userId}`, { params: { includeFile } });

/* ───────────────────────────── CREATE ──────────────────────────── */
//  'document' debe ser un objeto con las keys del body (title, …)
//  y dos prop. file   : File | Blob  (archivo principal)
//                   image : File | Blob  (portada PNG/JPG/JPEG)
export const createDocumentRequest = async (document) => {
  const fd = new FormData();

  // Campos simples
  Object.entries(document).forEach(([k, v]) => {
    if (k !== "file" && k !== "image" && v !== null && v !== undefined) {
      fd.append(k, String(v));
    }
  });

  // Archivos - asegurar que estén incluidos correctamente
  if (document.file) {
    fd.append("file", document.file, document.file.name);
    console.log("Archivo principal añadido:", document.file.name);
  }
  
  if (document.image) {
    fd.append("image", document.image, document.image.name);
    console.log("Imagen de portada añadida:", document.image.name);
  }

  // Debug: revisar contenido del FormData
  for (let pair of fd.entries()) {
    console.log(pair[0], pair[1]);
  }

  return axios.post("/resources", fd);
}

/* ───────────────────────────── UPDATE ──────────────────────────── */
//  Para actualizar, si quieres permitir cambiar archivos pasa los nuevos
//  en 'file' y/o 'image'; si no, omítelos y sólo enviará JSON.
export const updateDocumentRequest = async (document) => {
  const hasFile   = !!document.file;
  const hasImage  = !!document.image;

  if (hasFile || hasImage) {
    const fd = new FormData();
    Object.entries(document).forEach(([k, v]) => {
      if (k !== "file" && k !== "image") fd.append(k, String(v));
    });
    if (hasFile)  fd.append("file",  document.file);
    if (hasImage) fd.append("image", document.image);

    return axios.put(`/resources/${document.id}`, fd);
  }

  // Sólo campos de texto → JSON normal
  return axios.put(`/resources/${document.id}`, document);
};

/* ───────────────────────────── DELETE ──────────────────────────── */

export const deleteDocumentRequest = (id) =>
  axios.delete(`/resources/${id}`);

/* ──────────────────── vincular recurso ⇄ usuario ───────────────── */

export const createDocumentByUserRequest = (idUser, idResource) =>
  axios.post(`/resource-user`, { idUser, idResource });