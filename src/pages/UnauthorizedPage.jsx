import { Link } from 'react-router';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-lg text-gray-700 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        <Link 
          to="/" 
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}