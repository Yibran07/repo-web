import { createContext, useContext, useState, useCallback } from "react";
import { createDocumentRequest, getDocumentsRequest, getDocumentsByUserRequest, createDocumentByUserRequest, updateDocumentRequest, getDocumentRequest, getDocumentsUserRequest, disableDocumentRequest, enableDocumentRequest } from "../api/documents";

const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  // Add cache for individual documents
  const [documentCache, setDocumentCache] = useState({});

  // Estado para almacenar la relación entre documentos y usuarios
  const [documentUserRelations, setDocumentUserRelations] = useState([]);

  const createDocument = async (document) => {
    try {
      setLoading(true);
      const res = await createDocumentRequest(document);
      setDocuments(prevDocuments => [...prevDocuments, res.data.document]);
      return {
        success: true,
        data: res.data
      };
    } catch (error) {
      console.error("Error in createDocument:", error);

      const errorDetails = error.response?.data?.errors
        ? Object.entries(error.response.data.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
        : error.response?.data?.message || "Error desconocido";

      console.error("Error details:", errorDetails);

      return {
        success: false,
        message: error.response?.data?.message || `Error al crear el documento: ${errorDetails}`,
        error
      };
    }
    finally {
      setLoading(false);
    }
  };

  const createDocumentByUser = async (idUser, idResource) => {
    try {
      setLoading(true);
      const res = await createDocumentByUserRequest(idUser, idResource);
      return {
        success: true,
        data: res.data
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: err
      };
    } finally {
      setLoading(false);
    }
  };

  const getDocumentDirector = useCallback((documentId) => {
    if (!documentUserRelations.length) return null;

    const userRelations = documentUserRelations.filter(
      rel => rel.idResource === documentId
    );

    return userRelations;
  }, [documentUserRelations]);

  const getDocuments = useCallback(async (forceRefresh = false, includeFile = true) => {
    if (documents.length > 0 && !forceRefresh) return documents;

    try {
      setLoading(true);
      const [docsRes, relationsRes] = await Promise.all([
        getDocumentsRequest(includeFile),
        getDocumentsUserRequest()
      ]);

      setDocumentUserRelations(relationsRes.data.resourceUsers || []);

      const enrichedDocuments = { ...docsRes.data };
      if (enrichedDocuments.resources) {
        for (const doc of enrichedDocuments.resources) {
          const documentRelations = relationsRes.data.resourceUsers.filter(
            rel => rel.idResource === doc.idResource
          );

          doc.relatedUsers = documentRelations.map(rel => rel.idUser);
        }
      }

      setDocuments(enrichedDocuments);
      return enrichedDocuments;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [documents.length]);

  const getDocumentsByUser = useCallback(async (userId, includeFile = true) => {
    try {
      setLoading(true);
      const [docsRes, relationsRes] = await Promise.all([
        getDocumentsByUserRequest(userId, includeFile),
        getDocumentsUserRequest()
      ]);

      setDocumentUserRelations(relationsRes.data.resourceUsers || []);

      const enrichedDocuments = { ...docsRes.data };
      if (enrichedDocuments.resources) {
        for (const doc of enrichedDocuments.resources) {
          const documentRelations = relationsRes.data.resourceUsers.filter(
            rel => rel.idResource === doc.idResource
          );

          doc.relatedUsers = documentRelations.map(rel => rel.idUser);
        }
      }

      setDocuments(enrichedDocuments);
      return enrichedDocuments;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocument = async (document) => {
    try {
      setLoading(true);

      // ahora le pasamos idResource explícito
      const res = await updateDocumentRequest(document.idResource, document);

      // tras un PUT exitoso, refrescamos toda la lista
      await getDocuments(true);

      return { success: true, data: res.data };
    } catch (err) {
      console.error("Error actualizando documento:", err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };


  const disableDocument = async (id) => {
    try {
      setLoading(true);
      const res = await disableDocumentRequest(id);

      // We only get a message from the backend, so refresh the list to keep state in sync
      await getDocuments(true);
      return { success: true, data: res.data };
    } catch (err) {
      console.error(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const enableDocument = async (id) => {
    try {
      setLoading(true);
      const res = await enableDocumentRequest(id);

      // Refresh list after enabling
      await getDocuments(true);
      return { success: true, data: res.data };
    } catch (err) {
      console.error(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (id, includeFile = false) => {
    includeFile = false;

    // Try to get from cache first
    if (documentCache[id] && (documentCache[id].includeFile === true || !includeFile)) {
      return {
        success: true,
        data: { resource: documentCache[id].data }
      };
    }

    let foundDoc = null;

    if (documents && documents.resources) {
      foundDoc = documents.resources.find(doc =>
        doc.idResource === parseInt(id) || doc.idResource === id
      );
    } else if (Array.isArray(documents)) {
      foundDoc = documents.find(doc =>
        doc.idResource === parseInt(id) || doc.idResource === id
      );
    }

    if (foundDoc) {
      setDocumentCache(prev => ({
        ...prev,
        [id]: {
          data: foundDoc,
          includeFile: false,
          timestamp: Date.now()
        }
      }));

      return {
        success: true,
        data: { resource: foundDoc }
      };
    }

    try {
      setLoading(true);
      const res = await getDocumentRequest(id, includeFile);

      // Save to cache with timestamp
      setDocumentCache(prev => ({
        ...prev,
        [id]: {
          data: res.data.resource,
          includeFile,
          timestamp: Date.now()
        }
      }));

      return {
        success: true,
        data: res.data
      };
    } catch (error) {
      console.error("Error fetching document:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener el documento"
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener todas las relaciones documento-usuario - corregir nombre
  const getDocumentsUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDocumentsUserRequest();
      setDocumentUserRelations(res.data.resourceUsers || []);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DocumentContext.Provider value={{
      documents,
      loading,
      createDocument,
      getDocuments,
      updateDocument,
      disableDocument,
      enableDocument,
      getDocumentsByUser,
      createDocumentByUser,
      getDocument,
      getDocumentsUser, // Nombre corregido aquí
      documentUserRelations,
      getDocumentDirector
    }}>
      {children}
    </DocumentContext.Provider>
  );
}