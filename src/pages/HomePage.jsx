import React, { useState, useEffect } from 'react';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';

export default function HomePage() {
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const cardData = [
    {
      id: 1,
      title: "Avances en inteligencia artificial: nuevos horizontes",
      author: "Dr. López",
      date: "12/04/2023",
      category: "Tecnología",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "El impacto de la realidad virtual en la educación moderna",
      author: "Mtra. García",
      date: "05/07/2023",
      category: "Educación",
      imageUrl: "https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1854&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Desarrollo sostenible: retos y oportunidades",
      author: "Dr. Martínez",
      date: "23/08/2023",
      category: "Sostenibilidad",
      imageUrl: "https://images.unsplash.com/photo-1530533718754-001d2668365a?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Investigación biomédica: avances recientes",
      author: "Dra. Ramírez",
      date: "15/09/2023",
      category: "Salud",
      imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Economía circular y su aplicación en la industria",
      author: "Dr. Ortiz",
      date: "30/10/2023",
      category: "Economía",
      imageUrl: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=2069&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Innovaciones tecnológicas en la agricultura",
      author: "Mtro. Torres",
      date: "02/11/2023",
      category: "Agricultura",
      imageUrl: "https://images.unsplash.com/photo-1517093728432-a0440f8d45af?q=80&w=2074&auto=format&fit=crop"
    },
    {
      id: 7,
      title: "El futuro de las energías renovables",
      author: "Dra. Flores",
      date: "18/11/2023",
      category: "Energía",
      imageUrl: "https://images.unsplash.com/photo-1515705576963-95cad62945b6?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 8,
      title: "Neurociencia aplicada al aprendizaje",
      author: "Dr. Sánchez",
      date: "05/12/2023",
      category: "Ciencias Cognitivas",
      imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 9,
      title: "Neurociencia aplicada al aprendizaje",
      author: "Dr. Sánchez",
      date: "05/12/2023",
      category: "Ciencias Cognitivas",
      imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(8);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = cardData.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(cardData.length / cardsPerPage);

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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [cardData, currentPage, totalPages]);

  return (
    <div>
      <Navbar setShowMobileSidebar={setShowMobileSidebar} />

      <div className='flex flex-col md:flex-row relative'>
        <Sidebar 
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
          selectedFaculties={selectedFaculties}
          setSelectedFaculties={setSelectedFaculties}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedYears={selectedYears}
          setSelectedYears={setSelectedYears}
          selectedFormats={selectedFormats}
          setSelectedFormats={setSelectedFormats}
          selectedLanguages={selectedLanguages}
          setSelectedLanguages={setSelectedLanguages}
        />
        
        <div className='flex-1 p-4 flex flex-col'>
          <div className='flex-1'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {currentCards.map(card => (
                <Card 
                  key={card.id}
                  title={card.title}
                  author={card.author}
                  date={card.date}
                  category={card.category}
                  imageUrl={card.imageUrl}
                />
              ))}
            </div>
          </div>
          
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
        </div>
      </div>
    </div>
  );
}
