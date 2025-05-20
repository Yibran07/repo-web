import { useState, useEffect } from "react";
import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext"; 
import { useStudent } from "../context/StudentContext";
import { useDocuments } from "../context/DocumentContext";

const DocumentDetailModal = ({ isOpen, onClose, documentId }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getDocument } = useDocuments();
  const { categories } = useCategory();
  const { users } = useUser();
  const { students } = useStudent();

  console.log("DocumentDetailModal rendered - isOpen:", isOpen, "documentId:", documentId);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      if (documentId) {
        setLoading(true);
        try {
          const response = await getDocument(documentId, true); // true para incluir URLs de archivos
          if (response && response.success) {
            setDocument(response.data.resource);
          }
        } catch (error) {
          console.error("Error al obtener detalles del documento:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen && documentId) {
      fetchDocumentDetails();
    }
  }, [documentId, getDocument, isOpen]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.idCategory === categoryId);
    return category ? category.name : "Categoría desconocida";
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.idUser === userId);
    return user ? user.name : "Usuario desconocido";
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.idStudent === studentId);
    return student ? student.name : "Estudiante desconocido";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-600">Cargando detalles...</p>
          </div>
        ) : document ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-[#003DA5]">{document.title}</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {document.tempImageUrl ? (
                    <img 
                      src={document.tempImageUrl} 
                      alt={document.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-500">No hay imagen disponible</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Descripción</h3>
                  <p className="text-gray-700">{document.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Detalles del documento</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Categoría</p>
                      <p className="font-medium">{getCategoryName(document.idCategory)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha de publicación</p>
                      <p className="font-medium">{formatDate(document.datePublication)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">Participantes</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Estudiante</p>
                      <p className="font-medium">{getStudentName(document.idStudent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Director</p>
                      <p className="font-medium">{getUserName(document.idDirector)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revisores</p>
                      <p className="font-medium">{getUserName(document.idRevisor1)}, {getUserName(document.idRevisor2)}</p>
                    </div>
                  </div>
                </div>

                {document.tempFileUrl && (
                  <div className="mt-6">
                    <a 
                      href={document.tempFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block px-6 py-3 bg-[#003DA5] text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Ver documento completo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-600">No se encontró información del documento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetailModal;
