import { useState } from "react";

import Navbar from './../components/Navbar';
import UserFormModal from "../components/UserFormModal";

import { useUser } from "../context/UserContext";

import { showErrorToast, showSuccessToast } from "../util/toastUtils";

export default function UsersPage() {
  const { users, loading, deleteUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (career) => {
    setEditingUser(career);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const user = users.filter(user => user.rol === "user" || user.rol === "revisor" || user.rol === "director");


  async function handledelete(idUser) {
    let result;

    result = await deleteUser(idUser);
    if (result && result.success) {
      showSuccessToast("Usuario", "eliminado");
    }else {
      showErrorToast("Error al eliminar el usuario.")
    }
  }

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
            Agregar Revisor
          </button>
          
          {/* Botón para pantallas pequeñas */}
          <button 
            onClick={handleOpenAddModal}
            className="md:hidden bg-[#003DA5] rounded font-bold text-white text-sm px-4 py-2 flex items-center justify-center hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Agregar Revisor
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">Cargando revisores...</h2>
          </div>
        ) : user.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-600">No hay revisores disponibles</h2>
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
                    Correo Electrónico
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
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
                {user.map((user) => (
                  <tr key={user.idUser} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.idUser}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.rol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={`inline-block w-3 h-3 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handledelete(user.idUser)}
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
        <UserFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          user={editingUser}
        />
      )}
    </>
  );
}
