import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import DocumentViewModal from '../components/DocumentViewModal';
import { useDocuments } from '../context/DocumentContext';
import { useStudent } from '../context/StudentContext';
import { useUser } from '../context/UserContext';
import { useCareer } from '../context/CareerContext';

export default function HomePage() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(8);
  const [activeFilters, setActiveFilters] = useState({
    faculties: [],
    careers: [],
    categories: [],
    years: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Asegurarnos de usar el contexto de carreras correcto
  const { careers } = useCareer();
  const { students } = useStudent();
  const { users } = useUser();

  // Obtener el término de búsqueda del estado de navegación si existe
  useEffect(() => {
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

  // Función para manejar el clic en una card
  const handleCardClick = (docId) => {
    setSelectedDocumentId(docId);
    setShowDetailModal(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDocumentId(null);
  };

  // Asegúrate de usar el nombre correcto de la función
  const { getDocuments, documents, loading, documentUserRelations, getDocumentsUser } = useDocuments();
  const allDocuments = documents?.resources || [];

  // Función para manejar la búsqueda desde el navbar
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Resetear a la primera página cuando se busca
  };

  // Filtrar documentos basados en los filtros activos y el término de búsqueda
  const filteredDocuments = useMemo(() => {
    if (!allDocuments.length) return [];

    // Primera etapa: filtrar por filtros de sidebar
    let results = allDocuments.filter(doc => {
      // Encontrar el estudiante relacionado con este documento
      const student = students.find(s => s.idStudent === doc.idStudent);

      if (!student) return false; // Si no hay información del estudiante, no podemos filtrar correctamente

      // Filtrar por facultad (a través de estudiante -> carrera -> facultad)
      const passesFacultyFilter =
        activeFilters.faculties.length === 0 ||
        (student.idCareer &&
          activeFilters.faculties.some(facId => {
            // Buscar la carrera del estudiante y su facultad
            // Verificamos que careers exista y tenga datos
            if (!careers || !careers.length) return false;

            const studentCareer = careers.find(c => c.idCareer === student.idCareer);
            // Verificamos que la carrera exista y tenga idFaculty
            if (!studentCareer || !studentCareer.idFaculty) return false;

            // Verificar si la facultad de la carrera coincide
            return studentCareer.idFaculty.toString() === facId.toString();
          }));

      // Filtrar por carrera (a través de estudiante -> carrera)
      const passesCareerFilter =
        activeFilters.careers.length === 0 ||
        (student.idCareer && activeFilters.careers.includes(student.idCareer));

      // Filtrar por categoría (directamente del documento)
      const passesCategoryFilter =
        activeFilters.categories.length === 0 ||
        activeFilters.categories.includes(doc.idCategory);

      // Filtrar por año (directamente del documento)
      const passesYearFilter =
        activeFilters.years.length === 0 ||
        (doc.datePublication &&
          activeFilters.years.includes(new Date(doc.datePublication).getFullYear().toString()));

      return passesFacultyFilter && passesCareerFilter && passesCategoryFilter && passesYearFilter;
    });

    // Segunda etapa: filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(doc => {
        // Buscar en el título
        const titleMatch = doc.title && doc.title.toLowerCase().includes(term);

        // Buscar por autor (director)
        const author = users.find(user => user.idUser === doc.idDirector);
        const authorMatch = author && author.name.toLowerCase().includes(term);

        // Devolver documentos que coincidan con título o autor
        return titleMatch || authorMatch;
      });
    }

    return results;
  }, [allDocuments, activeFilters, searchTerm, students, users, careers]);

  // Manejar cambios en los filtros
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  // Paginación
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredDocuments.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredDocuments.length / cardsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToPreviousPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage !== totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredDocuments, currentPage, totalPages]);

  useEffect(() => {
    // Cargar documentos y relaciones usuario-documento
    getDocuments();
    getDocumentsUser(); // Nombre corregido
  }, [getDocuments, getDocumentsUser]);

  return (
    <div>
      <Navbar
        setShowMobileSidebar={setShowMobileSidebar}
        onSearch={handleSearch}
      />

      <div className='flex flex-col md:flex-row relative'>
        <Sidebar
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
          onFilterChange={handleFilterChange}
        />

        <div className='flex-1 p-4 flex flex-col'>
          {/* Mostrar el término de búsqueda si existe */}
          {searchTerm && (
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">
                  Resultados para: <span className="text-[#003DA5]">"{searchTerm}"</span>
                </h2>
                <button
                  className="text-sm text-red-600 hover:text-red-800 underline"
                  onClick={() => setSearchTerm("")}
                >
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          )}

          {/* Mostrar filtros activos como chips */}
          {(activeFilters.faculties.length > 0 ||
            activeFilters.careers.length > 0 ||
            activeFilters.categories.length > 0 ||
            activeFilters.years.length > 0) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {activeFilters.faculties.length > 0 && (
                  <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {activeFilters.faculties.length} facultad(es) seleccionada(s)
                  </div>
                )}
                {activeFilters.careers.length > 0 && (
                  <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {activeFilters.careers.length} carrera(s) seleccionada(s)
                  </div>
                )}
                {activeFilters.categories.length > 0 && (
                  <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {activeFilters.categories.length} categoría(s) seleccionada(s)
                  </div>
                )}
                {activeFilters.years.length > 0 && (
                  <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {activeFilters.years.length} año(s) seleccionado(s)
                  </div>
                )}
              </div>
            )}

          <div className='flex-1'>
            {loading ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-gray-600">Cargando documentos...</h2>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-gray-600">No hay documentos disponibles</h2>
                {(activeFilters.faculties.length > 0 ||
                  activeFilters.careers.length > 0 ||
                  activeFilters.categories.length > 0 ||
                  activeFilters.years.length > 0) && (
                    <p className="text-gray-500 mt-2">No se encontraron documentos con los filtros seleccionados</p>
                  )}
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {currentCards.map(card => {
                  // Encontrar los IDs de usuario relacionados con este documento
                  const relatedUserIds = documentUserRelations
                    .filter(rel => rel.idResource === card.idResource)
                    .map(rel => rel.idUser);

                  // Encontrar el director entre los usuarios relacionados
                  const directorUser = users.find(u =>
                    relatedUserIds.includes(u.idUser) && u.rol === 'director'
                  );

                  return (
                    <Card
                      key={card.idResource}
                      idResource={card.idResource}
                      title={card.title}
                      author={directorUser?.idUser || card.idDirector}
                      authorName={directorUser?.name} // Pasar el nombre del director directamente
                      date={card.datePublication}
                      category={card.idCategory}
                      imageUrl={card.imageUrl}
                      onClick={handleCardClick}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {filteredDocuments.length > 0 && (
            <div className="py-4 mt-2">
              <div className="flex justify-center">
                <nav className="flex items-center">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`mx-1 px-4 py-2 rounded-md ${currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    &laquo;
                  </button>

                  <div className="flex mx-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`mx-1 w-10 h-10 flex items-center justify-center rounded-md ${currentPage === number
                          ? 'bg-[#003DA5] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`mx-1 px-4 py-2 rounded-md ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver detalles del documento */}
      <DocumentViewModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        documentId={selectedDocumentId}
      />
    </div>
  );
}
