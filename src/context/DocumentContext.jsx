import { createContext, useContext, useState } from "react";

import {createDocumentsRequest, getDocumentsRequest} from "../api/document"


const DocumentContext = createContext()

export const useDocuments = () => {
    const context = useContext(DocumentContext)
    if (!context) {
        throw new Error("useDocument must be used within a DocumentProvider")
    }
    return context
}

export function DocumentProvider({ children }) {
    const [documents, setDocuments] = useState([])

    const createDocument = async (document) => {
        const res = await createDocumentsRequest(document) 
    }

    const getDocuments = async () => {
        const res = await getDocumentsRequest()
    }

  return (
    <DocumentContext.Provider value={{documents, createDocument, getDocuments}}>
      {children}
    </DocumentContext.Provider>
  )
}