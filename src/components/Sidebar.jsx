import React, { useState } from 'react';

const Sidebar = ({ 
  showMobileSidebar, 
  setShowMobileSidebar,
  selectedFaculties,
  setSelectedFaculties,
  selectedCategories,
  setSelectedCategories,
  selectedYears,
  setSelectedYears,
  selectedFormats,
  setSelectedFormats,
  selectedLanguages,
  setSelectedLanguages
}) => {
  
  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    faculty: true,  // Por defecto, la primera sección está expandida
    category: false,
    year: false,
    format: false,
    language: false
  });

  // Función para alternar la expansión de una sección
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Toggle selection function
  const toggleSelection = (item, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(item)) {
      setSelectedArray(selectedArray.filter(i => i !== item));
    } else {
      setSelectedArray([...selectedArray, item]);
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedFaculties([]);
    setSelectedCategories([]);
    setSelectedYears([]);
    setSelectedFormats([]);
    setSelectedLanguages([]);
  };

  return (
    <>
      {/* Mobile overlay for sidebar */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity duration-300 md:hidden ${
          showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileSidebar(false)}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
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
            
            {expandedSections.faculty && (
              <div className='space-y-2 mt-3'>
                {['Ciencias Administrativas', 'Ciencias de la Salud', 'Ingeniería', 'Arquitectura'].map((faculty) => (
                  <div 
                    key={faculty} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedFaculties.includes(faculty) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(faculty, selectedFaculties, setSelectedFaculties)}
                  >
                    {faculty}
                  </div>
                ))}
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
            
            {expandedSections.category && (
              <div className='space-y-2 mt-3'>
                {['Tesis', 'Proyectos de investigación', 'Artículos'].map((category) => (
                  <div 
                    key={category} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedCategories.includes(category) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                  >
                    {category}
                  </div>
                ))}
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
            
            {expandedSections.year && (
              <div className='space-y-2 mt-3'>
                {['2023', '2022', '2021', '2020'].map((year) => (
                  <div 
                    key={year} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedYears.includes(year) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(year, selectedYears, setSelectedYears)}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Formato filter - collapsible */}
          <div className='mb-3 border-b border-gray-200 pb-3'>
            <div 
              className='flex justify-between items-center cursor-pointer'
              onClick={() => toggleSection('format')}
            >
              <h3 className='font-semibold text-gray-700'>Formato</h3>
              <span className='text-gray-500'>
                {expandedSections.format ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.format && (
              <div className='space-y-2 mt-3'>
                {['PDF', 'DOCX', 'PPT'].map((format) => (
                  <div 
                    key={format} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedFormats.includes(format) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(format, selectedFormats, setSelectedFormats)}
                  >
                    {format}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Idioma filter - collapsible */}
          <div className='mb-3'>
            <div 
              className='flex justify-between items-center cursor-pointer'
              onClick={() => toggleSection('language')}
            >
              <h3 className='font-semibold text-gray-700'>Idioma</h3>
              <span className='text-gray-500'>
                {expandedSections.language ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.language && (
              <div className='space-y-2 mt-3'>
                {['Español', 'Inglés', 'Francés'].map((language) => (
                  <div 
                    key={language} 
                    className={`cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      selectedLanguages.includes(language) 
                        ? 'bg-blue-100 text-[#003DA5] font-medium' 
                        : 'hover:bg-blue-50 hover:text-[#003DA5]'
                    }`}
                    onClick={() => toggleSelection(language, selectedLanguages, setSelectedLanguages)}
                  >
                    {language}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
