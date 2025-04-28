import { useState } from "react";
import {useForm} from "react-hook-form";

import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../context/DocumentContext";

const DocumentFormModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSecondSupervisor, setShowSecondSupervisor] = useState(false);
  const {register, unregister, handleSubmit} = useForm()
  const {createdocument} = useDocuments()

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setShowSecondSupervisor(isChecked);
    if (!isChecked) {
      unregister("supervisor2");
    }
  };

  const onSubmit = handleSubmit((data) => {
    createdocument(data);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}>
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#003DA5]">Agregar Documento</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
            <label className="block text-gray-700 mb-1">Director</label>
            <select
              name="director"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("director")}
              required
            >
              <option value="">Seleccionar director</option>
              <option value="Tesis">Tesis</option>
              <option value="Proyecto Final">Proyecto Final</option>
              <option value="Investigación">Investigación</option>
              <option value="Artículo">Artículo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Primer supervisor</label>
              <select
                name="supervisor1"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("supervisor1")}
                required
              >
                <option value="">Seleccionar supervisor</option>
                <option value="Tesis">Tesis</option>
                <option value="Proyecto Final">Proyecto Final</option>
                <option value="Investigación">Investigación</option>
                <option value="Artículo">Artículo</option>
              </select>
            </div>

            <div className="flex justify-center items-center">
              <label className="text-gray-700 gap-4">¿Agregar otro supervisor?</label>
              <input 
                className="ml-4 h-5 w-5" 
                type="checkbox"
                checked={showSecondSupervisor}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>
          
          {showSecondSupervisor && (
            <div>
              <label className="block text-gray-700 mb-1">Segundo supervisor</label>
              <select
                name="supervisor2"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("supervisor2")}
                required={showSecondSupervisor}
              >
                <option value="">Seleccionar supervisor</option>
                <option value="Tesis">Tesis</option>
                <option value="Proyecto Final">Proyecto Final</option>
                <option value="Investigación">Investigación</option>
                <option value="Artículo">Artículo</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Año</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900"
                max={new Date().getFullYear()}
                {...register("año")}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Categoría</label>
              <select
                name="category"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("category")}
                required
              >
                <option value="Tesis">Tesis</option>
                <option value="Proyecto Final">Proyecto Final</option>
                <option value="Investigación">Investigación</option>
                <option value="Artículo">Artículo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Archivo (Imagen, Video o PDF)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.mp4"
              // onChange={handleFileChange}
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
              {loading ? "Subiendo..." : "Subir Documento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;
