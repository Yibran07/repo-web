import { createContext, useContext, useState, useCallback } from "react";
import { createDocumentRequest, getDocumentsRequest, getDocumentsByUserRequest, createDocumentByUserRequest, updateDocumentRequest, deleteDocumentRequest } from "../api/document";

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

    const createDocument = async (document) => {
      try {
        setLoading(true);
        const res = await createDocumentRequest(document);
        console.log(res.data);
        setDocuments(prevDocuments => [...prevDocuments, res.data.resource]);
        return {
          success: true,
          data: res.data
        };
      } catch(err) {
        console.error(err);
        return {
          success: false,
          error: err
        };
      } finally {
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
      } catch(err) {
        console.error(err);
        return {
          success: false,
          error: err
        };
      } finally {
        setLoading(false);
      }
    };

    const getDocuments = useCallback(async (forceRefresh = false) => {
      if (documents.length > 0 && !forceRefresh) return documents;
      
      try {
        setLoading(true);
        const res = await getDocumentsRequest();
        setDocuments(res.data);
        return res.data;
      } catch(err) {
        console.error(err);
        return [];
      } finally {
        setLoading(false);
      }
    }, [documents.length]);

    const getDocumentsByUser = useCallback(async (userId) => {
      try {
        setLoading(true);
        const res = await getDocumentsByUserRequest(userId);
        setDocuments(res.data);
        return res.data;
      } catch(err) {
        console.error(err);
        return [];
      } finally {
        setLoading(false);
      }
    }, []);

    const updateDocument = async (id, document) => {
      try {
        setLoading(true);
        const res = await updateDocumentRequest(id, document);
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => doc.idDocument === id ? res.data.document : doc)
        );
        return {
          success: true,
          data: res.data
        };
      } catch(err) {
        console.error(err);
        return {
          success: false,
          error: err
        };
      } finally {
        setLoading(false);
      }
    }

    const deleteDocument = async (id) => {
      try {
        setLoading(true);
        const res = await deleteDocumentRequest(id);
        setDocuments(prevDocuments => 
          prevDocuments.filter(doc => doc.idDocument !== id)
        );
        return {
          success: true,
          data: res.data
        };
      } catch(err) {
        console.error(err);
        return {
          success: false,
          error: err
        };
      } finally {
        setLoading(false);
      }
    }

    return (
        <DocumentContext.Provider value={{
          documents,
          loading,
          createDocument,
          getDocuments,
          updateDocument,
          deleteDocument,
          getDocumentsByUser,
          createDocumentByUser
        }}>
          {children}
        </DocumentContext.Provider>
    );
}