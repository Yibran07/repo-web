import { useState } from "react";

import Navbar from './../components/Navbar';
import CareerFormModal from './../components/CareerFormModal';
import ConfirmationModal from './../components/ConfirmationModal';

import { useCareer } from "../context/CareerContext";
import { useFaculty } from "../context/FacultyContext";

import { showErrorToast, showSuccessToast } from "../util/toastUtils";

export default function CareersPage() {
  const { careers, loading, deleteCareer } = useCareer();
  const { faculties } = useFaculty();
  const [showModal, setShowModal] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState(null);

  const handleOpenAddModal = () => {
    setEditingCareer(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (career) => {
    setEditingCareer(career);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCareer(null);
  };

  const handleDeleteConfirmation = (idCareer) => {
    setCareerToDelete(idCareer);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!careerToDelete) return;
    
    try {
      const result = await deleteCareer(careerToDelete);
      if (result && result.success) {
        showSuccessToast("Carrera", "eliminada");
      } else {
        showErrorToast("Error al eliminar la carrera");
      }
    } catch (error) {
      console.error("Error al eliminar carrera:", error);
      showErrorToast("Error al eliminar la carrera");
    } finally {
      setCareerToDelete(null);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">          
          {/* Botón para pantallas grandes */}
          <button 
            onClick={handleOpenAddModal}
            className="hidden md:flex bg-[#003DA5] text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition duration-300"
          >
            Agregar Carrera
          </button>
          
          {/* Botón para pantallas pequeñas */}
          <button 
            onClick={handleOpenAddModal}
            className="md:hidden bg-[#003DA5] rounded font-bold text-white text-sm px-4 py-2 flex items-center justify-center hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Agregar Carrera
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">Cargando carreras...</h2>
          </div>
        ) : careers.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">No hay carreras disponibles</h2>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facultad
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {careers.map((career) => (
                  <tr key={career.idCareer} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {career.idCareer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {career.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {faculties.find(faculty => faculty.idFaculty === career.idFaculty)?.name || 'Sin facultad'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(career)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteConfirmation(career.idCareer)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showModal && (
        <CareerFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          career={editingCareer}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar carrera"
        message="¿Estás seguro de que deseas eliminar esta carrera? Esta acción podría afectar a los estudiantes asociados."
        confirmButtonText="Eliminar"
        confirmButtonColor="red"
      />
    </>
  );
}
