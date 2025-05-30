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
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const { createDocument, createDocumentByUser, updateDocument, documentUserRelations } = useDocuments();
  const { user } = useAuth();
  const { categories } = useCategory();
  const { users } = useUser();
  const { students } = useStudent();

  const isEditing = !!document;
  const modalTitle = isEditing ? "Editar Recurso" : "Agregar Recurso";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  useEffect(() => {
    if (document) {
      // First set the basic document properties
      reset({
        idResource: document.idResource,
        title: document.title,
        description: document.description,
        datePublication: document.datePublication.split("T")[0],
        isActive: document.isActive,
        filePath: document.filePath,
        idStudent: document.idStudent,
        idCategory: document.idCategory,
        idDirector: document.idDirector
      });

      // Now find related users if we're editing a document
      if (isEditing && documentUserRelations && documentUserRelations.length > 0) {
        const docRelations = documentUserRelations.filter(
          rel => parseInt(rel.idResource) === parseInt(document.idResource)
        );

        // If we found relations, look for supervisor and reviewers
        if (docRelations && docRelations.length > 0) {
          // Find users with their roles
          const relatedUsersWithRoles = docRelations.map(rel => {
            const userId = parseInt(rel.idUser);
            const relatedUser = users.find(u => u.idUser === userId);
            return {
              id: userId,
              role: relatedUser?.rol || ''
            };
          });

          // Find supervisor
          const supervisor = relatedUsersWithRoles.find(u => u.role === 'supervisor');
          if (supervisor) {
            setValue('idSupervisor', supervisor.id);
          }

          // Find reviewers
          const reviewers = relatedUsersWithRoles.filter(u => u.role === 'revisor');
          if (reviewers.length >= 1) {
            setValue('idRevisor1', reviewers[0].id);
          }
          if (reviewers.length >= 2) {
            setValue('idRevisor2', reviewers[1].id);
          }

          // Find director (optional - might already be set from document.idDirector)
          const director = relatedUsersWithRoles.find(u => u.role === 'director');
          if (director) {
            setValue('idDirector', director.id);
          }
        }
      }
    } else {
      // New document - set defaults
      reset({
        idResource: null,
        title: "",
        description: "",
        datePublication: "",
        isActive: 1,
        idStudent: null,
        idCategory: null,
        idDirector: user.idUser,
        idSupervisor: null,
        idRevisor1: null,
        idRevisor2: null,
      });
    }
  }, [document, reset, user, isEditing, documentUserRelations, users, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);

      if (isEditing) {
        const updateData = {
          ...data,
          id: document.idResource
        };

        if (data.file && data.file[0]) {
          updateData.file = data.file[0];
        }

        if (data.image && data.image[0]) {
          updateData.image = data.image[0];
        }

        const result = await updateDocument(updateData);
        if (result && result.success) {
          showSuccessToast("Recurso actualizado exitosamente");
          onClose();
        } else {
          showErrorToast("Error al actualizar el recurso");
        }

      } else {
        // Ensure we have valid File objects for new documents
        if (!data.file || !data.file[0] || !data.image || !data.image[0]) {
          showErrorToast("Por favor selecciona ambos archivos: documento principal e imagen de portada");
          setLoading(false);
          return;
        }

        // Guardar las referencias de los usuarios antes de eliminarlas del formData
        const idDirector = String(data.idDirector);
        const idSupervisor = String(data.idSupervisor);
        const idRevisor1 = String(data.idRevisor1);
        const idRevisor2 = String(data.idRevisor2);

        // Preparar el FormData solo con los datos necesarios para el recurso, sin los IDs de usuarios
        const formData = {
          title: data.title,
          description: data.description,
          datePublication: data.datePublication,
          isActive: "1",
          idStudent: String(data.idStudent),
          idCategory: String(data.idCategory),
          file: data.file[0],
          image: data.image[0]
        };

        try {
          const response = await createDocument(formData);

          if (response && response.success) {
            const resourceId = response.data.resource.idResource;

            // Crear las relaciones con los usuarios
            const userRelationPromises = [
              createDocumentByUser(idDirector, resourceId),
              createDocumentByUser(idSupervisor, resourceId),
              createDocumentByUser(idRevisor1, resourceId),
              createDocumentByUser(idRevisor2, resourceId)
            ];

            // Esperar a que todas las relaciones se completen
            await Promise.all(userRelationPromises);

            showSuccessToast("Recurso creado exitosamente");
            onClose();
          } else {
            showErrorToast(response?.message || "Error al crear el recurso");
          }
        } catch (err) {
          console.error("API call error:", err);
          showErrorToast("Error al comunicarse con el servidor");
        }
      }
    } catch (err) {
      console.error("Error completo:", err);

      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 400 ? "Error en la solicitud: datos inválidos" : "Error al procesar el recurso");
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  // Check for required select fields
  const validateSelectField = (value) => {
    return value !== "" && value !== null && value !== undefined;
  };

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
          {/* Form fields - add error validation messages */}
          <div>
            <label className="block text-gray-700 mb-1">Título</label>
            <input
              type="text"
              className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("title", { required: "El título es obligatorio" })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
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
              className={`w-full border ${errors.idStudent ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("idStudent", {
                required: "Debes seleccionar un estudiante",
                validate: validateSelectField
              })}
            >
              <option value="">Seleccionar estudiante</option>
              {students.map(student => (
                <option key={student.idStudent} value={student.idStudent}>
                  {student.name}
                </option>
              ))}
            </select>
            {errors.idStudent && <p className="text-red-500 text-xs mt-1">{errors.idStudent.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Supervisor</label>
            <select
              className={`w-full border ${errors.idStudent ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("idSupervisor", {
                required: "Debes seleccionar un supervisor",
                validate: validateSelectField
              })}
            >
              <option value="">Seleccionar Supervisor</option>
              {users
                .filter(user => user.rol === "supervisor")
                .map(user => (
                  <option key={user.idUser} value={user.idUser}>
                    {user.name}
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
                  .filter(user => user.rol === "revisor")
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
                  .filter(user => user.rol === "revisor")
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
              className={`w-full border ${errors.file ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("file", {
                required: isEditing ? false : "Debes seleccionar un archivo"
              })}
            />
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
            {isEditing && document.filePath && (
              <p className="text-xs text-gray-500 mt-1">
                Archivo actual: {document.filePath.split('/').pop()}
                <br />
                Solo sube un nuevo archivo si deseas reemplazar el existente.
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Imagen de portada</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              className={`w-full border ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("image", {
                required: isEditing ? false : "Debes seleccionar una imagen de portada"
              })}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            {isEditing && document.imageUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Imagen de portada actual:</p>
                <img
                  src={document.imageUrl}
                  alt="Portada actual"
                  className="h-20 object-contain border rounded"
                />
              </div>
            )}
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
