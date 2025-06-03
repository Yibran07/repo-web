import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { showSuccessToast, showErrorToast } from "../util/toastUtils";
import { useCategory } from "../context/CategoryContext";

/* ────────────────────────────────────────────────────────────── */
/* Helper – capitaliza solo la primera letra y pone el resto en
   minúsculas. Si recibe null/undefined, devuelve ""              */
const normalize = (str = "") =>
  str.length
    ? str[0].toUpperCase() + str.slice(1).toLowerCase()
    : "";

const CategoryFormModal = ({ isOpen, onClose, category }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { createCategory, updateCategory } = useCategory();

  const isEditing = !!category;
  const modalTitle = isEditing ? "Editar Categoría" : "Agregar Categoría";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  /* ───────────── Carga inicial (modo edición o nuevo) ──────────── */
  useEffect(() => {
    if (category) {
      reset({
        idCategory: category.idCategory,
        name: normalize(category.name),
        description: normalize(category.description)
      });
    } else {
      reset({ idCategory: null, name: "", description: "" });
    }
  }, [category, reset]);

  /* ────────────────────────── Submit ──────────────────────────── */
  const onSubmit = handleSubmit(async (formValues) => {
    try {
      setLoading(true);

      /* Normalizar antes de enviar */
      const payload = {
        ...formValues,
        name: normalize(formValues.name),
        description: normalize(formValues.description)
      };

      let result;
      if (isEditing) {
        result = await updateCategory(payload.idCategory, payload);
        result?.success
          ? showSuccessToast("Categoría", "actualizada")
          : showErrorToast("Error al actualizar la categoría");
      } else {
        result = await createCategory(payload);
        result?.success
          ? showSuccessToast("Categoría", "creada")
          : showErrorToast("Error al crear la categoría");
      }

      if (result?.success) onClose();
    } catch (err) {
      console.error(err);
      showErrorToast("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  /* ────────────────────────── UI ──────────────────────────────── */
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#003DA5]">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              {...register("description")}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Descripción de la categoría"
            ></textarea>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#003DA5] text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Procesando..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;