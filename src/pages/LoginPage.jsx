import { useForm } from "react-hook-form"
import { useNavigate, Link } from 'react-router';
import { useEffect, useState } from 'react';

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { signin, isAuthenticated, errors: siginErrors } = useAuth()
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated])

  const onSubmit = handleSubmit((data) => {
    signin(data)
  })

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/escritorioLogin.jpg')"
      }}
    >
      {/* Card del formulario */}
      <div className="relative z-10 max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold mb-2">Inicio de Sesión</h1>
          <Link
            className='bg-[#003DA5] text-white border-2 border-[#003DA5] px-4 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300 whitespace-nowrap'
            to="/"
          >Inicio
          </Link>
        </div>
        {/*<p className="text-gray-600 mb-6">¿No eres un miembro? <Link to="/register" className="text-[#003DA5] cursor-pointer hover:underline">Registrate</Link></p>*/}

        {siginErrors.map((error, i) => (
          <div key={i} className='bg-red-500 p-2 text-white text-center'>
            {error.message}
          </div>
        ))}

        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              {...register("email", { required: true })}
              className='w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent'
              placeholder="Ingrese su correo electrónico"
            />
            {errors.email && <span className='text-red-500 text-sm'>El correo electrónico es requerido</span>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: true })}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 pr-12 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  /* Eye closed icon */
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.024.153-2.007.438-2.937m2.123-2.582A9.935 9.935 0 0112 3c5.523 0 10 4.477 10 10 0 1.333-.263 2.606-.739 3.77M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6l-6-6m0 0l-6-6m6 6l6 6m-6-6l-6 6" />
                  </svg>
                ) : (
                  /* Eye open icon */
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 3.866-3.582 7-8 7s-8-3.134-8-7 3.582-7 8-7 8 3.134 8 7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-sm">La contraseña es requerida</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#003DA5] hover:bg-[#002d7a] text-white font-medium py-3 px-4 rounded-md transition-colors mt-6"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
