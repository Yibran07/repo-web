import { BrowserRouter, Routes, Route } from "react-router"

import RegisterPage from "./pages/RegisterPage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import DocumentsPage from "./pages/DocumentsPage"
import ProtectedRoute from "./ProtectedRoute"

import { AuthProvider } from "./context/AuthContext"
import { DocumentProvider } from "./context/DocumentContext"


export default function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />

          <Route element={<ProtectedRoute/>}>
            <Route path="/documents" element={<DocumentsPage/>} />
            {/* <Route path="/documents/:id" element={<DocumentFormPage/>} /> */}
            <Route path="/profile" element={<div>Profile</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      </DocumentProvider>
    </AuthProvider>
  )
}
