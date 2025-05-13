import { BrowserRouter, Routes, Route } from "react-router";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DocumentsPage from "./pages/DocumentsPage";
import ProtectedRoute from "./ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import CategoriesPage from "./pages/CategoriesPage";
import FacultiesPage from './pages/FacultiesPage';
import CareersPage from "./pages/CareersPage";
import UsersPage from "./pages/UsersPage";
import StudentsPage from "./pages/StudentsPage";

import { AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";
import { UserProvider } from "./context/UserContext";
import { CareerProvider } from "./context/CareerContext";
import { FacultyProvider } from "./context/FacultyContext";
import { DocumentProvider } from "./context/DocumentContext";
import { StudentProvider } from "./context/StudentContext";

import BackendCheck from "./util/BackendCheck";

export default function App() {
  return (
    <BackendCheck>
      <AuthProvider>
        <UserProvider>
          <StudentProvider>
            <CategoryProvider>
              <CareerProvider>
                <FacultyProvider>
                  <DocumentProvider>
                    <BrowserRouter>
                      <ToastContainer 
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                      />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage/>} />
                        <Route path="/register" element={<RegisterPage/>} />
                        <Route path="/unauthorized" element={<UnauthorizedPage/>} />

                        <Route element={<ProtectedRoute allowedRoles={["user", "director", "revisor"]}/>}>
                          <Route path="/documents" element={<DocumentsPage/>} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={["admin"]}/>}>
                          <Route path="/faculties" element={<FacultiesPage/>} />
                          <Route path="/categories" element={<CategoriesPage/>} />
                          <Route path="/careers" element={<CareersPage/>} />
                          <Route path="/reviewers" element={<UsersPage/>} />
                          <Route path="/students" element={<StudentsPage/>} />
                        </Route>
                      </Routes>
                    </BrowserRouter>
                  </DocumentProvider>
                </FacultyProvider>
              </CareerProvider>
            </CategoryProvider>
          </StudentProvider>
        </UserProvider>
      </AuthProvider>
    </BackendCheck>
  );
}
