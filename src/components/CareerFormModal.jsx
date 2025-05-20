import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useCareer } from "../context/CareerContext";
import { useFaculty } from "../context/FacultyContext";

import { showErrorToast, showSuccessToast } from "../util/toastUtils";

const CareerFormModal = ({ isOpen, onClose, career }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { createCareer, updateCareer } = useCareer();
  const { faculties } = useFaculty();
  
  const isEditing = !!career;
  const modalTitle = isEditing ? "Editar Carrera" : "Agregar Carrera";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  useEffect(() => {
    if (career) {
      reset({
        idCareer: career.idCareer,
        name: career.name,
        idFaculty: career.idFaculty || null
      });
    } else {
      reset({
        idCareer: null,
        name: "",
        idFaculty: null
      });
    }
  }, [career, reset]);

  const onSubmit = handleSubmit(async (career) => {
    try {
      setLoading(true);
      let result;

      if (!isEditing) {
        result = await createCareer(career);
        if (result && result.success) {
          showSuccessToast("Carrera", "creada");
        }else{
          showErrorToast("Error al crear la carrera")
        }
      }else{
        result = await updateCareer(career.idCareer, career);
        if (result && result.success) {
          showSuccessToast("Carrera", "actualizada");
        }else{
          showErrorToast("Error al actualizar la carrera")
        }
      }
      
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#003DA5]">{modalTitle}</h2>
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
            <label htmlFor="name" className="block text-gray-700 mb-1">Nombre</label>
            <input
              id="name"
              type="text"
              {...register("name", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la carrera"
              required
            />
          </div>

          <div>
            <label htmlFor="idFaculty" className="block text-gray-700 mb-1">Facultad</label>
            <select
                name="idFaculty"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("idFaculty")}
                required
              >
                <option value="">Seleccionar facultad</option>
                {faculties.map(faculty => (
                  <option key={faculty.idFaculty} value={faculty.idFaculty}>
                    {faculty.name}
                  </option>
                ))}
              </select>
          </div>

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

export default CareerFormModal;
