import { useState } from "react";
import { useFaculty } from "../context/FacultyContext";
import Navbar from '../components/Navbar';
import FacultyFormModal from "../components/FacultyFormModal";

export default function FacultiesPage() {
  const { faculties, loading, deleteFaculty } = useFaculty();
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

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
                        onClick={() => deleteFaculty(faculty.idFaculty)}
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
    </>
  );
}
