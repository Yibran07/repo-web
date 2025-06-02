import { useState, useEffect, useMemo } from 'react';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import DocumentFormModal from '../components/DocumentFormModal';
import DocumentViewModal from '../components/DocumentViewModal';
import ConfirmationModal from '../components/ConfirmationModal';

import { useDocuments } from "../context/DocumentContext";
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { useUser } from '../context/UserContext';
import { useCareer } from '../context/CareerContext';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Corregir el nombre de la función aquí
  const { getDocumentsByUser, documents, loading, disableDocument, enableDocument, documentUserRelations, getDocumentsUser } = useDocuments();

  const { user } = useAuth();
  const { students } = useStudent();
  const { users } = useUser();
  const { careers } = useCareer(); // Cambio importante: obtener careers del context correcto
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
            if (!student || !student.idCareer) return false;

            // Verificamos que careers exista y tenga datos
            if (!careers || !careers.length) return false;

            // Buscar la carrera y su facultad
            const studentCareer = careers.find(c => c.idCareer === student.idCareer);
            if (!studentCareer || !studentCareer.idFaculty) return false;

            // Verificar si la facultad de la carrera coincide
            return studentCareer.idFaculty.toString() === facId.toString();
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
    if (user && user.idUser) {
      getDocumentsByUser(user.idUser);
      getDocumentsUser(); // Nombre corregido
    }
  }, [getDocumentsByUser, getDocumentsUser, user]);

  // Add logging to debug image path issues
  useEffect(() => {
    if (filteredDocuments && filteredDocuments.length > 0) {
      console.log("First document in filtered list:", filteredDocuments[0]);
    }
  }, [filteredDocuments]);

  // Función para editar un documento
  const handleEditDocument = (docId) => {
    const document = filteredDocuments.find(doc => doc.idResource === docId);
    if (document) {
      setSelectedDocument(document);
      setShowEditModal(true);
    }
  };

  // Función para mostrar el modal de confirmación de activación/desactivación
  const handleDeleteConfirmation = (docId) => {
    setDocumentToDelete(docId);
    setShowDeleteModal(true);
  };

  // Función para activar o desactivar un documento después de la confirmación
  const handleToggleDocumentStatus = async () => {
    if (!documentToDelete) return;
    // Buscar el documento en la lista filtrada
    const document = filteredDocuments.find(doc => doc.idResource === documentToDelete);
    if (!document) {
      showErrorToast("Documento no encontrado");
      setDocumentToDelete(null);
      setShowDeleteModal(false);
      return;
    }
    try {
      let result;
      if (document.isActive) {
        result = await disableDocument(documentToDelete);
      } else {
        result = await enableDocument(documentToDelete);
      }
      if (result && result.success) {
        showSuccessToast(
          document.isActive
            ? "Documento deshabilitado exitosamente"
            : "Documento habilitado exitosamente"
        );
        // Refrescar la lista de documentos
        if (user && user.idUser) {
          getDocumentsByUser(user.idUser);
        }
      } else {
        showErrorToast(result?.message || "Error al actualizar el estado del documento");
      }
    } catch (error) {
      console.error("Error al actualizar estado del documento:", error);
      showErrorToast("Error al actualizar el estado del documento");
    } finally {
      setDocumentToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDocument(null);
  };

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
                {currentCards.map(card => {
                  // Encontrar los IDs de usuario relacionados con este documento
                  const relatedUserIds = documentUserRelations
                    .filter(rel => rel.idResource === card.idResource)
                    .map(rel => rel.idUser);

                  // Encontrar el director entre los usuarios relacionados
                  const directorUser = users.find(u =>
                    relatedUserIds.includes(u.idUser) && u.rol === 'director'
                  );

                  // Determine the correct image URL to use
                  const imageUrl = card.imageUrl ||
                    (card.imagePath ?
                      `${process.env.REACT_APP_API_URL}${card.imagePath}` :
                      null);

                  return (
                    <Card
                      key={card.idResource}
                      idResource={card.idResource}
                      title={card.title}
                      author={directorUser?.idUser || card.idDirector}
                      authorName={directorUser?.name} // Pasar el nombre del director
                      date={card.datePublication}
                      category={card.idCategory}
                      imageUrl={imageUrl}
                      onEdit={handleEditDocument}
                      onDelete={handleDeleteConfirmation}
                      isUserDocument={user && user.idUser === (directorUser?.idUser || card.idDirector)}
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

      {showEditModal && (
        <DocumentFormModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          document={selectedDocument}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleToggleDocumentStatus}
        title={
          (() => {
            const doc = filteredDocuments.find(d => d.idResource === documentToDelete);
            if (!doc) return "Actualizar estado";
            return doc.isActive ? "Deshabilitar documento" : "Habilitar documento";
          })()
        }
        message={
          (() => {
            const doc = filteredDocuments.find(d => d.idResource === documentToDelete);
            if (!doc) return "¿Estás seguro de que deseas actualizar el estado de este documento?";
            return doc.isActive
              ? "¿Estás seguro de que deseas deshabilitar este documento? Los usuarios no podrán acceder a él mientras esté deshabilitado."
              : "¿Estás seguro de que deseas habilitar este documento? Los usuarios podrán acceder a él nuevamente.";
          })()
        }
        confirmButtonText={
          (() => {
            const doc = filteredDocuments.find(d => d.idResource === documentToDelete);
            if (!doc) return "Confirmar";
            return doc.isActive ? "Deshabilitar" : "Habilitar";
          })()
        }
        confirmButtonColor={
          (() => {
            const doc = filteredDocuments.find(d => d.idResource === documentToDelete);
            if (!doc) return "blue";
            return doc.isActive ? "red" : "green";
          })()
        }
      />

      <DocumentViewModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        documentId={selectedDocumentId}
      />
    </div>
  )
}
