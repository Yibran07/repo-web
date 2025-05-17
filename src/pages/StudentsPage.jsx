import { useState } from "react";

import Navbar from './../components/Navbar';
import StudentFormModal from "../components/StudentFormModal";
import ConfirmationModal from "../components/ConfirmationModal";

import { useStudent } from "../context/StudentContext";
import { useCareer } from "../context/CareerContext";

import { showErrorToast, showSuccessToast } from "../util/toastUtils";

export default function StudentsPage() {
  const { students, loading, deleteStudent } = useStudent();
  const { careers } = useCareer();
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (career) => {
    setEditingStudent(career);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  // Función para mostrar el modal de confirmación
  const handleDeleteConfirmation = (idStudent) => {
    setStudentToDelete(idStudent);
    setShowDeleteModal(true);
  };

  // Función para eliminar después de la confirmación
  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      const result = await deleteStudent(studentToDelete);
      if (result && result.success) {
        showSuccessToast("Estudiante", "eliminado");
      } else {
        showErrorToast("Error al eliminar el estudiante");
      }
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
      showErrorToast("Error al eliminar el estudiante");
    } finally {
      setStudentToDelete(null);
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
            Agregar Estudiante
          </button>
          
          {/* Botón para pantallas pequeñas */}
          <button 
            onClick={handleOpenAddModal}
            className="md:hidden bg-[#003DA5] rounded font-bold text-white text-sm px-4 py-2 flex items-center justify-center hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Agregar Estudiante
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">Cargando estudiantes...</h2>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">No hay estudiantes disponibles</h2>
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
                    Carrera
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.idStudent} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.idStudent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {careers.find(career => career.idCareer === student.idCareer)?.name || "Sin carrera asignada"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={`inline-block w-3 h-3 rounded-full ${student.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteConfirmation(student.idStudent)}
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
        <StudentFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          student={editingStudent}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar estudiante"
        message="¿Estás seguro de que deseas eliminar este estudiante? Esta acción podría afectar a los documentos asociados."
        confirmButtonText="Eliminar"
        confirmButtonColor="red"
      />
    </>
  );
}

