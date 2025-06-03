import { useNavigate, Link, useLocation } from "react-router";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import DocumentFormModal from "./DocumentFormModal";

const Navbar = ({ setShowMobileSidebar, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Manejar el término de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar el envío de la búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }

    // Si el usuario no está en la página principal, redirigirlo allí
    if (location.pathname !== '/') {
      navigate('/', { state: { searchTerm } });
    }
  };

  const textButtonDesk = location.pathname === '/documents' ? 'Documentos' : 'Mis Documentos';
  const textButtonMobile = location.pathname === '/documents' ? 'Docs' : 'Mis Docs';

  const handleToggleDocuments = () => {
    if (location.pathname === '/documents') {
      navigate('/');
    } else {
      navigate('/documents');
    }
  }

  const adminRoutes = [
    { path: '/categories', label: 'Categorias', documentLabel: 'Documentos' },
    { path: '/faculties', label: 'Facultades', documentLabel: 'Documentos' },
    { path: '/careers', label: 'Carreras', documentLabel: 'Documentos' },
    { path: '/reviewers', label: 'Usuarios', documentLabel: 'Documentos' },
    { path: '/students', label: 'Estudiantes', documentLabel: 'Documentos' }
  ];

  const getButtonText = (routeConfig) => {
    return location.pathname === routeConfig.path ? routeConfig.documentLabel : routeConfig.label;
  };

  const handleAdminNavigation = (route) => {
    if (location.pathname === route.path) {
      navigate('/');
    } else {
      navigate(route.path);
    }
  };

  // Función para determinar si un botón está activo
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className='bg-[#003DA5] text-white p-4'>
        <div className='container mx-auto'>
          {/* Versión desktop del navbar */}
          <div className='hidden md:flex md:flex-row items-center justify-between'>
            <div className='flex items-center'>
              <div className='mr-4'>
                <img src="/images/logo_Salle.svg" alt="Logo" className="h-15 w-15 rounded-md" />
              </div>
              <div className='text-left'>
                <div className='font-bold text-xl'>Repositorio Digital de Trabajos de Titulación</div>
                <div className='text-sm text-[#FFFFFF80]'>Universidad La Salle Oaxaca</div>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-end space-x-10">
                  <p className="text-[#FFFFFF80]">Bienvenido: {user.name}</p>
                  {user.rol === "director" && (
                    <button
                      className='bg-transparent border-2 border-white px-4 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300'
                      onClick={handleOpenModal}
                    >
                      Agregar Documento
                    </button>
                  )}
                  <Link
                    className='bg-transparent border-2 border-white px-2 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300 -ml-5'
                    onClick={() => { logout() }}
                    to="/"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="w-5 h-5"
                      fill="currentColor"
                    >
                      <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
                    </svg>
                  </Link>
                </div>
              </>
            ) : (
              <button className='bg-transparent border-2 border-white px-4 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300' onClick={() => navigate('/login')}>
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Versión mobile del navbar */}
          <div className='flex flex-col md:hidden'>
            <div className='flex items-center mb-4'>
              <div className='mr-4'>
                <img src="/images/logo.jpg" alt="Logo" className="h-10 rounded-md" />
              </div>
              <div className='text-left'>
                <div className='font-bold text-sm'>Repositorio Digital de Trabajos de Titulación</div>
                <div className='text-xs text-[#FFFFFF80]'>Universidad La Salle Oaxaca</div>
              </div>
            </div>

            <div className='w-full max-w-2xl mx-auto mt-2 mb-4'>
              <form onSubmit={handleSearchSubmit} className='flex'>
                <input
                  className='py-2 px-4 rounded-l text-[#999999] w-full text-sm border-2 border-white'
                  placeholder='Buscar por título o autor...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button
                  type="submit"
                  className='bg-white text-[#003DA5] px-2 py-2 rounded-r font-bold hover:bg-transparent hover:text-white hover:border-white border-2 transition duration-300 whitespace-nowrap text-sm'
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    className="w-5 h-5"
                    fill="currentColor">
                    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                  </svg>
                </button>

                {(isAuthenticated && (user.rol !== 'admin')) && (
                  <button
                    className='bg-transparent border-2 border-white px-4 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300 ml-2 whitespace-nowrap text-sm'
                    onClick={handleToggleDocuments}>
                    {textButtonMobile}
                  </button>
                )}
              </form>
            </div>

            <div className='flex justify-between items-center'>
              <button
                className='bg-white text-[#003DA5] px-4 py-2 rounded font-bold hover:bg-transparent hover:text-white hover:border-white border-2 transition duration-300 text-sm'
                onClick={() => setShowMobileSidebar(prev => !prev)}
              >
                Filtros
              </button>

              {isAuthenticated ? (
                <div className="flex items-center justify-end space-x-3">
                  <p className="text-sm text-[#FFFFFF80]">Bienvenido: {user.name}</p>
                  {user.rol !== 'admin' && (
                    <button
                      className='bg-transparent border-2 border-white px-3 py-1 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300 text-base'
                      onClick={handleOpenModal}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="w-5 h-5"
                        fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zm48 96a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm16 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 48-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0 0 48c0 8.8 7.2 16 16 16s16-7.2 16-16l0-48 48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0 0-48z" /></svg>
                    </button>
                  )}
                  <Link
                    className='bg-transparent border-2 border-white px-3 py-1 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300 -ml-1.5'
                    onClick={() => { logout() }}
                    to="/"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 576 512"
                      className="w-5 h-5"
                      fill="currentColor"
                    >
                      <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <button className='bg-transparent border-2 border-white px-4 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300' onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>

          {/* Barra de búsqueda en desktop */}
          <div className='hidden md:flex w-full flex-row items-center mt-4 justify-center'>
            <div className='w-full max-w-2xl mx-auto'>
              <form onSubmit={handleSearchSubmit} className='flex'>
                <input
                  className='py-2 px-4 rounded-l text-[#999999] w-full'
                  placeholder='Buscar por título o autor...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button
                  type="submit"
                  className='bg-white text-[#003DA5] px-4 py-2 rounded-r font-bold hover:bg-transparent hover:text-white hover:border-white border-2 transition duration-300 whitespace-nowrap'
                >
                  Buscar
                </button>
                {(isAuthenticated && (user.rol !== 'admin')) && (
                  <button
                    type="button"
                    className='bg-transparent border-2 border-white px-4 py-2 rounded font-bold hover:bg-white hover:text-[#003DA5] transition duration-300 ml-5 whitespace-nowrap'
                    onClick={handleToggleDocuments}
                  >
                    {textButtonDesk}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </nav>

      {(isAuthenticated && (user.rol === 'admin')) && (
        <div className='w-full py-3'>
          {/* Versión para escritorio */}
          <div className='hidden md:flex container mx-auto justify-center'>
            <div className='flex flex-wrap gap-10'>
              {adminRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => handleAdminNavigation(route)}
                  className={`${isActiveRoute(route.path)
                    ? 'bg-white text-[#003DA5]'
                    : 'bg-[#003DA5] text-white hover:bg-white hover:text-[#003DA5]'
                    } border-2 border-[#003DA5] px-4 py-2 rounded font-bold transition duration-300 whitespace-nowrap`}
                >
                  {getButtonText(route)}
                </button>
              ))}
            </div>
          </div>

          {/* Versión para móvil */}
          <div className='md:hidden container mx-auto px-8'>
            <div className='grid grid-cols-2 gap-2 text-center'>
              {adminRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => handleAdminNavigation(route)}
                  className={`${isActiveRoute(route.path)
                    ? 'bg-white text-[#003DA5]'
                    : 'bg-[#003DA5] text-white hover:bg-white hover:text-[#003DA5]'
                    } border-2 text-sm border-[#003DA5] px-3 py-2 rounded font-bold transition duration-300 whitespace-nowrap`}
                >
                  {getButtonText(route)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModal && <DocumentFormModal isOpen={showModal} onClose={handleCloseModal} />}
    </>
  );
};

export default Navbar;
