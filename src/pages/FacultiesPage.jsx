import { useState } from "react";

import { useFaculty } from "../context/FacultyContext";

import Navbar from '../components/Navbar';
import FacultyFormModal from "../components/FacultyFormModal";
import ConfirmationModal from "../components/ConfirmationModal";

import { showErrorToast, showSuccessToast } from "../util/toastUtils";

export default function FacultiesPage() {
  const { faculties, loading, deleteFaculty } = useFaculty();
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  const handleOpenAddModal = () => {
    setEditingFaculty(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (faculty) => {
    setEditingFaculty(faculty);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaculty(null);
  };

  // Función para mostrar el modal de confirmación
  const handleDeleteConfirmation = (idFaculty) => {
    setFacultyToDelete(idFaculty);
    setShowDeleteModal(true);
  };

  // Función para eliminar después de la confirmación
  const handleDelete = async () => {
    if (!facultyToDelete) return;
    
    try {
      const result = await deleteFaculty(facultyToDelete);
      if (result && result.success) {
        showSuccessToast("Facultad", "eliminada");
      } else {
        showErrorToast("Error al eliminar la facultad.");
      }
    } catch (error) {
      console.error("Error al eliminar facultad:", error);
      showErrorToast("Error al eliminar la facultad");
    } finally {
      setFacultyToDelete(null);
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
            Agregar Facultad
          </button>
          
          {/* Botón para pantallas pequeñas */}
          <button 
            onClick={handleOpenAddModal}
            className="md:hidden bg-[#003DA5] rounded font-bold text-white text-sm px-4 py-2 flex items-center justify-center hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Agregar Facultad
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">Cargando facultades...</h2>
          </div>
        ) : faculties.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">No hay facultades disponibles</h2>
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faculties.map((faculty) => (
                  <tr key={faculty.idFaculty} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {faculty.idFaculty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {faculty.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(faculty)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteConfirmation(faculty.idFaculty)}
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
        <FacultyFormModal 
          isOpen={showModal}
          onClose={handleCloseModal}
          faculty={editingFaculty}
        />
      )}
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar facultad"
        message="¿Estás seguro de que deseas eliminar esta facultad? Esta acción podría afectar a las carreras asociadas."
        confirmButtonText="Eliminar"
        confirmButtonColor="red"
      />
    </>
  );
}
