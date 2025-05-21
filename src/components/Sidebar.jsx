import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import { useCategory } from '../context/CategoryContext';
import { useFaculty } from '../context/FacultyContext';
import { useDocuments } from '../context/DocumentContext';
//import { useStudent } from '../context/StudentContext';

const Sidebar = ({ 
  showMobileSidebar, 
  setShowMobileSidebar,
  onFilterChange
}) => {
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  
  const { faculties } = useFaculty();
  const { careers } = useCareer();
  const { categories } = useCategory();
  const { documents } = useDocuments();
  //const { students } = useStudent();
  
  const [availableYears, setAvailableYears] = useState([]);
  
  // Extraer años únicos de los documentos
  useEffect(() => {
    if (documents?.resources) {
      const years = [...new Set(documents.resources.map(doc => {
        if (!doc.datePublication) return null;
        return new Date(doc.datePublication).getFullYear().toString();
      }).filter(Boolean))].sort((a, b) => b - a); // Ordenar descendente
      
      setAvailableYears(years);
    }
  }, [documents]);
  
  // Expandir/colapsar secciones
  const [expandedSections, setExpandedSections] = useState({
    faculty: false,
    career: false,
    category: false,
    year: false
  });

  // Función para alternar la expansión de una sección
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Toggle selection function
  const toggleSelection = (item, selectedArray, setSelectedArray, type) => {
    let newSelection;
    if (selectedArray.includes(item)) {
      newSelection = selectedArray.filter(i => i !== item);
    } else {
      newSelection = [...selectedArray, item];
    }
    setSelectedArray(newSelection);
    
    // Si cambia la selección de facultades, podríamos filtrar las carreras relevantes
    if (type === 'faculty') {
      // Si no hay facultades seleccionadas, no filtramos carreras
      if (newSelection.length === 0) {
        // No hacemos nada especial, todas las carreras se mostrarán
      }
    }
    
    // Notificar al componente padre sobre el cambio de filtros
    updateFilters(type, newSelection);
  };
  
  // Actualizar filtros y notificar al componente padre
  const updateFilters = (changedType, newSelection) => {
    const filters = {
      faculties: changedType === 'faculty' ? newSelection : selectedFaculties,
      careers: changedType === 'career' ? newSelection : selectedCareers,
      categories: changedType === 'category' ? newSelection : selectedCategories,
      years: changedType === 'year' ? newSelection : selectedYears
    };
    
    onFilterChange(filters);
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedFaculties([]);
    setSelectedCareers([]);
    setSelectedCategories([]);
    setSelectedYears([]);
    
    onFilterChange({
      faculties: [],
      careers: [],
      categories: [],
      years: []
    });
  };

  return (
    <>
      {/* Mobile overlay for sidebar */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity duration-300 md:hidden ${
          showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileSidebar(false)}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 20 }}
      ></div>
      
      {/* Left sidebar for filters - desktop always visible, mobile toggleable */}
      <div 
        className={`fixed md:relative left-0 top-0 h-full md:h-auto z-30 md:z-auto w-3/4 md:w-64 m-0 md:m-4 transition-transform duration-300 ease-in-out ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className='p-5 h-[100vh] md:h-[calc(100vh-200px)] overflow-y-auto bg-gray-50 shadow-lg md:rounded-lg'>
          <div className='flex justify-between items-center md:hidden mb-4'>
            <h2 className='font-bold text-lg text-[#003DA5]'>Filtros</h2>
            <button 
              className='text-gray-500 hover:text-[#003DA5]'
              onClick={() => setShowMobileSidebar(false)}
            >
              ✕
            </button>
          </div>
          
          {/* Desktop header with clear filters button */}
          <div className='hidden md:flex justify-between items-center mb-5'>
            <h2 className='font-bold text-lg text-[#003DA5]'>Filtros</h2>
            <button 
              className='font-medium text-sm text-[#C8102E] hover:underline cursor-pointer'
              onClick={clearAllFilters}
            >
              Limpiar Filtros
            </button>
          </div>
          
          {/* Mobile clear filters button (below the X) */}
          <div className='md:hidden mb-4'>
            <button 
              className='font-medium text-sm text-[#C8102E] hover:underline cursor-pointer'
              onClick={clearAllFilters}
            >
              Limpiar Filtros
            </button>
          </div>
          
          {/* Facultad filter - collapsible */}
          <div className='mb-3 border-b border-gray-200 pb-3'>
            <div 
              className='flex justify-between items-center cursor-pointer'
              onClick={() => toggleSection('faculty')}
            >
              <h3 className='font-semibold text-gray-700'>Facultad</h3>
              <span className='text-gray-500'>
                {expandedSections.faculty ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.faculty && faculties.length > 0 && (
              <div className='space-y-2 mt-3'>
                {faculties.map((faculty) => (
                  <div 
                    key={faculty.idFaculty} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedFaculties.includes(faculty.idFaculty) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(faculty.idFaculty, selectedFaculties, setSelectedFaculties, 'faculty')}
                  >
                    {faculty.name}
                  </div>
                ))}
              </div>
            )}
            
            {expandedSections.faculty && faculties.length === 0 && (
              <div className='mt-3 text-gray-500 italic text-sm'>
                No hay facultades disponibles
              </div>
            )}
          </div>
          
          {/* Carrera filter - collapsible */}
          <div className='mb-3 border-b border-gray-200 pb-3'>
            <div 
              className='flex justify-between items-center cursor-pointer'
              onClick={() => toggleSection('career')}
            >
              <h3 className='font-semibold text-gray-700'>Carrera</h3>
              <span className='text-gray-500'>
                {expandedSections.career ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.career && careers.length > 0 && (
              <div className='space-y-2 mt-3'>
                {careers
                  // Opcionalmente filtrar por facultades seleccionadas
                  .filter(career => {
                    if (selectedFaculties.length === 0) return true;
                    return selectedFaculties.includes(career.idFaculty);
                  })
                  .map((career) => (
                    <div 
                      key={career.idCareer} 
                      className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                        selectedCareers.includes(career.idCareer) 
                          ? 'bg-blue-100 text-[#003DA5] font-medium' 
                          : 'hover:bg-blue-50 hover:text-[#003DA5]'
                      }`}
                      onClick={() => toggleSelection(career.idCareer, selectedCareers, setSelectedCareers, 'career')}
                    >
                      {career.name}
                    </div>
                  ))}
              </div>
            )}
            
            {expandedSections.career && careers.length === 0 && (
              <div className='mt-3 text-gray-500 italic text-sm'>
                No hay carreras disponibles
              </div>
            )}
          </div>
          
          {/* Categoría filter - collapsible */}
          <div className='mb-3 border-b border-gray-200 pb-3'>
            <div 
              className='flex justify-between items-center cursor-pointer'
              onClick={() => toggleSection('category')}
            >
              <h3 className='font-semibold text-gray-700'>Categoría</h3>
              <span className='text-gray-500'>
                {expandedSections.category ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.category && categories.length > 0 && (
              <div className='space-y-2 mt-3'>
                {categories.map((category) => (
                  <div 
                    key={category.idCategory} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedCategories.includes(category.idCategory) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(category.idCategory, selectedCategories, setSelectedCategories, 'category')}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
            
            {expandedSections.category && categories.length === 0 && (
              <div className='mt-3 text-gray-500 italic text-sm'>
                No hay categorías disponibles
              </div>
            )}
          </div>
          
          {/* Año filter - collapsible */}
          <div className='mb-3 border-b border-gray-200 pb-3'>
            <div 
              className='flex justify-between items-center cursor-pointer'
              onClick={() => toggleSection('year')}
            >
              <h3 className='font-semibold text-gray-700'>Año</h3>
              <span className='text-gray-500'>
                {expandedSections.year ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.year && availableYears.length > 0 && (
              <div className='space-y-2 mt-3'>
                {availableYears.map((year) => (
                  <div 
                    key={year} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedYears.includes(year) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(year, selectedYears, setSelectedYears, 'year')}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
            
            {expandedSections.year && availableYears.length === 0 && (
              <div className='mt-3 text-gray-500 italic text-sm'>
                No hay años disponibles
              </div>
            )}
          </div>
          
          {/* {selectedFaculties.length > 0 || selectedCareers.length > 0 || selectedCategories.length > 0 || selectedYears.length > 0 ? (
            <div className='mt-4'>
              <button
                className='w-full py-2 px-3 bg-[#003DA5] text-white rounded font-medium hover:bg-blue-700 transition-colors'
                onClick={() => onFilterChange({
                  faculties: selectedFaculties, 
                  careers: selectedCareers,
                  categories: selectedCategories,
                  years: selectedYears
                })}
              >
                Aplicar Filtros
              </button>
            </div>
          ) : null} */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
