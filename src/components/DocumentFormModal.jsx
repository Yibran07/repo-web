import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useDocuments } from "../context/DocumentContext";
import { useAuth } from "../context/AuthContext";
import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext";
import { useStudent } from "../context/StudentContext";

import { showSuccessToast, showErrorToast } from "../util/toastUtils";


const DocumentFormModal = ({ isOpen, onClose, document }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { createDocument, createDocumentByUser } = useDocuments();
  const { user } = useAuth();
  const { categories } = useCategory();
  const { users } = useUser();
  const { students } = useStudent();

  const isEditing = !!document;
  const modalTitle = isEditing ? "Editar Recurso" : "Agregar Recurso";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  useEffect(() => {
      if (document) {
        reset({
          idResource: document.idResource,
          title: document.title,
          description: document.description,
          datePublication: document.datePublication.split("T")[0],
          isActive: document.isActive,
          filePath: document.filePath,
          idStudent: document.idStudent,
          idCategory: document.idCategory,
          idDirector: document.idDirector,
          idRevisor1: document.idRevisor1,
          idRevisor2: document.idRevisor2,
        });
      } else {
        reset({
          idResource: null,
          title: "",
          description: "",
          datePublication: "",
          isActive: 1,
          idStudent: null,
          idCategory: null,
          idDirector: user.idUser,
          idRevisor1: null,
          idRevisor2: null,
        });
      }
    }, [document, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      console.log(data);
      const rescre = await createDocument(data);
      await createDocumentByUser(user.idUser, rescre.data.resource.idResource);
      if (rescre && rescre.success) {
        showSuccessToast("Recurso", "creado");
        onClose();
      }else{
        showErrorToast("Error al crear el Recurso");
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}>
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#003DA5]">{modalTitle}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block text-gray-700 mb-1">Título</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("title")}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              {...register("description")}
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Estudiante</label>
            <select
              name="idStudent"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("idStudent")}
              required
            >
              <option value="">Seleccionar estudiante</option>
              {students.map(student => (
                <option key={student.idStudent} value={student.idStudent}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Primer revisor</label>
              <select
                name="idRevisor1"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("idRevisor1")}
                required
              >
                <option value="">Seleccionar revisor</option>
                {users
                .filter(user => user.rol !== "director" && user.rol !== "admin")
                .map(user => (
                  <option key={user.idUser} value={user.idUser}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Segundo revisor</label>
              <select
                name="idRevisor2"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("idRevisor2")}
                required
              >
                <option value="">Seleccionar revisor</option>
                {users
                .filter(user => user.rol !== "director" && user.rol !== "admin")
                .map(user => (
                  <option key={user.idUser} value={user.idUser}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
                {...register("datePublication")}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Categoría</label>
              <select
                name="idCategory"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("idCategory")}
                required
              >
                <option value="">Seleccionar categoria</option>
                {categories.map(category => (
                  <option key={category.idCategory} value={category.idCategory}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Archivo (Imagen, Video o PDF)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.mp4"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("file")}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Imagen de portada</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("image")}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#003DA5] text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Procesando..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;
