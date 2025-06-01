import { useState, useEffect } from "react";
import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext";
import { useStudent } from "../context/StudentContext";
import { useDocuments } from "../context/DocumentContext";
import { getCompleteFileUrl } from "../util/urlUtils";
import { Document, Page, pdfjs } from 'react-pdf';
// Configure pdf.js worker (needed by react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import { useCareer } from "../context/CareerContext";
import { useFaculty } from "../context/FacultyContext";

const DocumentViewModal = ({ isOpen, onClose, documentId }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getDocument, documents, documentUserRelations } = useDocuments();
  const { categories } = useCategory();
  const { users } = useUser();
  const { students } = useStudent();
  const { careers } = useCareer();
  const { faculties } = useFaculty();

  // Track related users for this document
  const [relatedUsers, setRelatedUsers] = useState([]);

  // New state for PDF viewing
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);

  // Prefetch document data when modal is opened
  useEffect(() => {
    let mounted = true;

    const fetchDocumentDetails = async () => {
      if (!documentId || !isOpen) return;

      setLoading(true);
      setError(null);

      try {
        // IMPORTANT: Always use includeFile=false to avoid 500 errors
        const response = await getDocument(documentId, false);
        if (!mounted) return;

        if (response && response.success) {
          const docResource = response.data.resource;
          setDocument(docResource);

          // Find related users directly from documentUserRelations
          const resourceId = parseInt(docResource.idResource);

          const docRelations = documentUserRelations.filter(
            rel => parseInt(rel.idResource) === resourceId
          );

          setRelatedUsers(docRelations || []);
        } else {
          // Try to find the document in the already loaded documents list
          let foundDoc = null;

          // Check if documents is an object with resources property
          if (documents && documents.resources) {
            foundDoc = documents.resources.find(doc =>
              doc.idResource === parseInt(documentId) || doc.idResource === documentId
            );
          }
          // Or if it's an array
          else if (Array.isArray(documents)) {
            foundDoc = documents.find(doc =>
              doc.idResource === parseInt(documentId) || doc.idResource === documentId
            );
          }

          if (foundDoc) {
            console.log("Using document from cache:", foundDoc);
            setDocument(foundDoc);
          } else {
            setError("No se pudo cargar la información del documento");
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Error al obtener detalles del documento:", error);
        setError(error.message || "Error al cargar el documento");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (isOpen) {
      fetchDocumentDetails();
    }

    return () => {
      mounted = false;
      if (!isOpen) {
        setDocument(null);
        setRelatedUsers([]);
      }
    };
  }, [documentId, getDocument, isOpen, documents, documentUserRelations]);

  if (!isOpen) return null;

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.idCategory === categoryId);
    return category ? category.name : "Categoría desconocida";
  };

  // Add helper function to get faculty info through the relationship chain
  const getFacultyInfo = () => {
    if (!document || !document.idStudent) return { id: null, name: "No especificada" };

    // Find the student
    const student = students.find(s => s.idStudent === document.idStudent);
    if (!student || !student.idCareer) return { id: null, name: "No especificada" };

    const career = careers.find(c => c.idCareer === student.idCareer);
    if (!career || !career.idFaculty) return { id: null, name: "No especificada" };

    const faculty = faculties.find(f => f.idFaculty === career.idFaculty);

    return {
      id: career.idFaculty,
      name: faculty ? faculty.name : `Facultad ID: ${career.idFaculty}`
    };
  };

  // Add helper function to get career info through the relationship chain
  const getCareerInfo = () => {
    if (!document || !document.idStudent) return { id: null, name: "No especificada" };

    // Find the student
    const student = students.find(s => s.idStudent === document.idStudent);
    if (!student || !student.idCareer) return { id: null, name: "No especificada" };

    const career = careers.find(c => c.idCareer === student.idCareer);

    return {
      id: student.idCareer,
      name: career ? career.name : `Carrera ID: ${student.idCareer}`
    };
  };

  // Get users with director role
  const getDirectors = () => {
    return relatedUsers
      .filter(rel => {
        const user = users?.find(u => u.idUser === parseInt(rel.idUser));
        return user?.rol === 'director';
      })
      .map(rel => {
        const user = users?.find(u => u.idUser === parseInt(rel.idUser));
        return {
          id: rel.idUser,
          name: user?.name || `Usuario ID: ${rel.idUser}`,
          role: 'director'
        };
      });
  };

  // Get users with supervisor role
  const getSupervisors = () => {
    return relatedUsers
      .filter(rel => {
        const user = users?.find(u => u.idUser === parseInt(rel.idUser));
        return user?.rol === 'supervisor';
      })
      .map(rel => {
        const user = users?.find(u => u.idUser === parseInt(rel.idUser));
        return {
          id: rel.idUser,
          name: user?.name || `Usuario ID: ${rel.idUser}`,
          role: 'supervisor'
        };
      });
  };

  // Get users with revisor role
  const getRevisors = () => {
    return relatedUsers
      .filter(rel => {
        const user = users?.find(u => u.idUser === parseInt(rel.idUser));
        return user?.rol === 'revisor';
      })
      .map(rel => {
        const user = users?.find(u => u.idUser === parseInt(rel.idUser));
        return {
          id: rel.idUser,
          name: user?.name || `Usuario ID: ${rel.idUser}`,
          role: 'revisor'
        };
      });
  };

  // Add missing getStudentName function
  const getStudentName = (studentId) => {
    const student = students.find(s => s.idStudent === studentId);
    return student ? student.name : "Estudiante desconocido";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Define displayParticipantsByRoles with updated layout
  const displayParticipantsByRoles = () => {
    return (
      <div className="space-y-4">
        {/* First row: Student and Director */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Estudiante</p>
            <p className="font-medium">{getStudentName(document.idStudent)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Director</p>
            {getDirectors().length > 0 ? (
              <p className="font-medium">
                {getDirectors().map(director => director.name).join(', ')}
              </p>
            ) : (
              <p className="text-gray-400 italic">No asignado</p>
            )}
          </div>
        </div>

        {/* Second row: Supervisor and Reviewers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Supervisor</p>
            {getSupervisors().length > 0 ? (
              <p className="font-medium">
                {getSupervisors().map(supervisor => supervisor.name).join(', ')}
              </p>
            ) : (
              <p className="text-gray-400 italic">No asignado</p>
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm">Revisores</p>
            {getRevisors().length > 0 ? (
              <p className="font-medium">
                {getRevisors().map(revisor => revisor.name).join(', ')}
              </p>
            ) : (
              <p className="text-gray-400 italic">No asignados</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(false);
  }

  function onDocumentLoadError(error) {
    console.error('PDF loading error:', error);
    setPdfError(true);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  }

  // Ensure we always fetch the raw PDF bytes (especially from Dropbox)
  const getViewableUrl = (url) => {
    if (!url) return null;

    // Dropbox temporary links sometimes point to an HTML preview page.
    // Appending raw=1 forces Dropbox to return the file content itself,
    // which pdf.js can fetch without CORS issues.
    if (url.includes('dropboxusercontent.com') && !url.includes('raw=1')) {
      return url + (url.includes('?') ? '&raw=1' : '?raw=1');
    }

    return url;
  };

  // Render a PDF preview using react‑pdf, and gracefully fall back to
  // Google’s viewer if pdf.js fails (e.g. because of CORS).
  const renderPdfPreview = (fileUrl) => {
    const viewableUrl = getViewableUrl(fileUrl);

    // If react‑pdf already failed once we show the fallback iframe
    if (pdfError) {
      const googleViewer = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        viewableUrl
      )}`;
      return (
        <iframe
          src={googleViewer}
          title="PDF fallback"
          className="w-full h-full border-0 bg-gray-100"
        />
      );
    }

    return (
      <div className="w-full bg-gray-100 flex flex-col h-full">
        <div className="flex-grow flex justify-center p-1 bg-gray-200 h-full">
          <Document
            file={viewableUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex justify-center h-full"
            loading={
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600">Cargando PDF…</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={1.2}
              renderTextLayer={false}
              className="shadow-md"
            />
          </Document>
        </div>

        {numPages && (
          <div className="p-2 bg-gray-100 flex justify-between items-center border-t">
            <button
              disabled={pageNumber <= 1}
              onClick={() => changePage(-1)}
              className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500"
            >
              Anterior
            </button>
            <p className="text-sm text-center">
              Página <span className="font-bold">{pageNumber}</span> de{' '}
              <span className="font-bold">{numPages}</span>
            </p>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => changePage(1)}
              className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    );
  };

  // Enhance the document preview section to better handle PDFs
  const renderFilePreview = (doc) => {
    // If we have a tempFileUrl, use it directly - it's already a complete URL
    // Otherwise, use the filePath which needs to be transformed with getCompleteFileUrl
    const fileUrl = doc.embedUrl || (doc.filePath ? getCompleteFileUrl(doc.filePath) : null);

    console.log("Preview file URL:", fileUrl);

    // Try to determine if it's a PDF by Dropbox URL or extension
    const isPdf =
      fileUrl.toLowerCase().endsWith('.pdf') ||
      doc.filePath?.toLowerCase().endsWith('.pdf') ||
      fileUrl.includes('dropboxusercontent.com');

    if (isPdf) {
      return renderPdfPreview(fileUrl);
    }
    // Handle images
    else if (fileUrl.match(/\.(jpe?g|png|gif)$/i)) {
      return (
        <img
          src={fileUrl}
          alt="Vista previa de imagen"
          className="w-full h-full object-contain bg-gray-100"
        />
      );
    }
    // Handle videos
    else if (fileUrl.match(/\.(mp4|webm|mov)$/i)) {
      return (
        <video
          src={fileUrl}
          controls
          className="w-full h-full"
        ></video>
      );
    }
    // Fallback for other file types
    else {
      return (
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
          <div className="text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">Vista previa no disponible</p>
        </div>
      );
    }
  };

  // Helper function to get the best download URL
  const getDownloadUrl = (doc) => {
    // Prefer tempFileUrl for direct download from cloud storage
    return doc.downloadUrl || getCompleteFileUrl(doc.filePath);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#003DA5]">Detalles del recurso</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 space-y-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <p className="text-xl text-gray-600">Cargando detalles...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        ) : document ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">{document.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="overflow-hidden rounded-lg border h-full">
                  {document.imageUrl || document.filePath ? (
                    <img
                      src={getCompleteFileUrl(document.imageUrl || document.filePath)}
                      alt={document.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No hay imagen disponible</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Información general</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Categoría</p>
                      <p className="font-medium">{getCategoryName(document.idCategory)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Fecha de publicación</p>
                      <p className="font-medium">{formatDate(document.datePublication)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Participantes</h4>
                  <div>
                    {displayParticipantsByRoles()}
                  </div>
                </div>

                {/* Re-enable career and faculty information */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Información académica</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Carrera</p>
                      <p className="font-medium">{getCareerInfo().name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Facultad</p>
                      <p className="font-medium">{getFacultyInfo().name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Descripción</h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-gray-600">{document.description}</p>
              </div>
            </div>

            {/* Document preview section - full width and expanded */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Vista previa del documento</h4>
                <div className="flex space-x-1">
                  <a
                    href={getDownloadUrl(document)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="Descargar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="h-[500px]">  {/* Increased height for larger preview */}
                  {renderFilePreview(document)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600">No se encontró información del documento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewModal;
