import { useAuth } from './context/AuthContext'

import { Navigate, Outlet } from 'react-router'

export default function ProtectedRoute() {
  const {user, isAuthenticated, loading} = useAuth()

  if(loading) {
    return <div className="flex justify-center items-center h-screen"><h1 className="text-2xl">Cargando...</h1></div>
  }
  if(!loading && !isAuthenticated) {
    return <Navigate to="/login" replace={true} />
  }

  return (
    <Outlet/>
  )
}
