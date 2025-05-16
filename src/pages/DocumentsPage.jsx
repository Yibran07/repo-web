import { useState, useEffect, useMemo } from 'react';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

import { useDocuments } from "../context/DocumentContext";
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { useUser } from '../context/UserContext';

import { showErrorToast, showSuccessToast } from "../util/toastUtils";

export default function DocumentsPage() {
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

  const { getDocumentsByUser, documents, loading } = useDocuments();
  const { user } = useAuth();
  const { students } = useStudent();
  const { users } = useUser();
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
      // Aplicar filtros existentes (facultades, carreras, categorías, años)
      // Filtrar por facultad (a través de estudiante -> carrera -> facultad)
      const passesFacultyFilter = 
        activeFilters.faculties.length === 0 || 
        (doc.idStudent && 
          activeFilters.faculties.some(facId => {
            // Buscar la carrera del estudiante
            const student = students.find(s => s.idStudent === doc.idStudent);
            const studentCareer = student ? student.career : null;
            
            // Verificar si la facultad de la carrera coincide
            return studentCareer && studentCareer.idFaculty === facId;
          }));
      
      // Filtrar por carrera (a través de estudiante -> carrera)
      const passesCareerFilter = 
        activeFilters.careers.length === 0 || 
        (doc.idStudent && activeFilters.careers.includes(doc.idStudent));
      
      // Filtro por categoría (directamente del documento)
      const passesCategoryFilter = 
        activeFilters.categories.length === 0 || 
        activeFilters.categories.includes(doc.idCategory);
      
      // Filtro por año (directamente del documento)
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
  }, [allDocuments, activeFilters, searchTerm, students, users]);
  
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
    if (user && user.idUser) {
      getDocumentsByUser(user.idUser);
    }
  }, [getDocumentsByUser, user]);

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
              {/* Similar a HomePage... */}
              <button 
                className="text-sm text-red-600 hover:text-red-800 underline"
                onClick={() => handleFilterChange({
                  faculties: [],
                  careers: [],
                  categories: [],
                  years: []
                })}
              >
                Limpiar filtros
              </button>
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
                {currentCards.map(card => (
                  <Card 
                    key={card.idResource}
                    title={card.title}
                    author={card.idDirector}
                    date={card.datePublication}
                    category={card.idCategory}
                    imageUrl={card.imageUrl}
                  />
                ))}
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
                    className={`mx-1 px-4 py-2 rounded-md ${
                      currentPage === 1 
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
                        className={`mx-1 w-10 h-10 flex items-center justify-center rounded-md ${
                          currentPage === number
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
                    className={`mx-1 px-4 py-2 rounded-md ${
                      currentPage === totalPages 
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
    </div>
  )
}
