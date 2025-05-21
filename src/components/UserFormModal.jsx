import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "../context/UserContext";
import { showErrorToast, showSuccessToast } from "../util/toastUtils";

const UserFormModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { createUser, updateUser, errors: registerErrors } = useUser();
  
  const isEditing = !!user;
  const modalTitle = isEditing ? "Editar Revisor" : "Agregar Revisor";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  useEffect(() => {
    if (user) {
      reset({
        idUser: user.idUser,
        name: user.name,
        email: user.email,
        rol: user.rol,
        isActive: user.isActive,
      });
    } else {
      reset({
        idUser: null,
        name: "",
        email: "",
        rol: "",
        isActive: 1,
      });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (user) => {
    try {
      setLoading(true);
      let result;

      if (!isEditing) {
        result = await createUser(user);
        if (result && result.success) {
          showSuccessToast("Usuario", "creado");
        }else{
          showErrorToast("Error al crear el usuario")
        }
      } else {
        result = await updateUser(user.idUser, user);
        if (result && result.success) {
          showSuccessToast("Usuario", "actualizado");
        }else{
          showErrorToast("Error al actualizar el usuario")
        }
      }
      
      if (result && result.success) {
        onClose();
      }
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

        {registerErrors && registerErrors.length > 0 && (
          <div className="mb-4">
            {registerErrors.map((error, i) => (
              <div key={i} className='bg-red-500 p-2 mb-2 text-white text-center rounded'>
                {error.message}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">Nombre</label>
            <input
              id="name"
              type="text"
              {...register("name", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              {...register("email", { 
                required: "El correo electrónico es obligatorio", 
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Ingrese un correo electrónico válido"
                }
              })}
              className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              placeholder="nombre@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">Contraseña</label>
              <input
                id="password"
                type="password"
                {...register("password", { required: true })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contraseña del usuario"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="rol" className="block text-gray-700 mb-1">Rol</label>
            <select
              id="rol"
              {...register("rol", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
                <option value="">Selecciona un rol </option>
                <option value="director">Director</option>
                <option value="revisor">Revisor</option>
                <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {isEditing && (
            <div>
                <label htmlFor="isActive" className="block text-gray-700 mb-1">Estado</label>
                <select
                    id="isActive"
                    {...register("isActive", { required: true })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                <option value="">Seleccionar estado</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
                </select>
            </div>
          )}

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

export default UserFormModal;
