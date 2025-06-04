import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { getCompleteFileUrl } from "../util/urlUtils";

export default function Card({ 
  title, 
  author, 
  authorName, // Nuevo prop para recibir directamente el nombre del autor
  date, 
  category, 
  imageUrl, 
  idResource, 
  onEdit, 
  onDelete, 
  isUserDocument,
  onClick
}) {
  const { users } = useUser();
  const { categories } = useCategory();
  const { user } = useAuth();

  const displayAuthorName = authorName || users.find(user => user.idUser === author)?.name || "Autor desconocido";
  const categoryName = categories.find(cat => cat.idCategory === category)?.name || "Categoría desconocida";

  const canManageDocument = user?.rol === 'director' && isUserDocument;

  const handleCardClick = (e) => {
    if (!e.target.closest('button') && onClick) {
      onClick(idResource);
    }
  };

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-lg h-55 relative group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110 overflow-hidden">
        {imageUrl ? (
          <img 
            src={getCompleteFileUrl(imageUrl)} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500 text-xs">Sin imagen</p>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="opacity-80">{date ? date.split("T")[0] : "Sin fecha"}</span>
          <span className="opacity-80 truncate max-w-[40%]" title={displayAuthorName}>{displayAuthorName}</span>
        </div>
        <h3 className="font-bold text-lg truncate" title={title || "Sin título"}>{title || "Sin título"}</h3>
        
        <div className="flex items-center justify-between">
          <p className="opacity-80 text-xs truncate max-w-[70%]" title={categoryName}>{categoryName}</p>
          
          {canManageDocument && (
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(idResource);
                }} 
                className="p-1 text-white hover:text-blue-300 transition-colors"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(idResource);
                }} 
                className="p-1 text-white hover:text-red-300 transition-colors"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
