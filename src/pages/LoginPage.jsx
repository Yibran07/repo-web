import { useForm } from "react-hook-form"
import { useNavigate, Link } from 'react-router';
import { useEffect } from 'react';

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const {register, handleSubmit, formState: {errors}} = useForm()
  const {signin, isAuthenticated, errors: siginErrors} = useAuth()
  const navigate = useNavigate();


  useEffect(() => {
      if(isAuthenticated) {
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
              {...register("email", {required: true})} 
              className='w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent'
              placeholder="Ingrese su correo electrónico"
            />
            {errors.email && <span className='text-red-500 text-sm'>El correo electrónico es requerido</span>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              id="password"
              type="password" 
              {...register("password", {required: true})} 
              className='w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent'
              placeholder="Ingrese su contraseña"
            />
            {errors.password && <span className='text-red-500 text-sm'>La contraseña es requerida</span>}
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
