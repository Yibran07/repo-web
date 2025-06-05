import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useDocuments } from "../context/DocumentContext";
import { useAuth } from "../context/AuthContext";
import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext";
import { useStudent } from "../context/StudentContext";

import { showSuccessToast, showErrorToast } from "../util/toastUtils";

const DocumentFormModal = ({ isOpen, onClose, document }) => {
  /* ───── estados ───────────────────────────────────────────── */
  const [loading, setLoading] = useState(false);

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
    setValue,
  } = useForm();

  // texto visible
  const [display, setDisplay] = useState({
    idStudent: "",
    idSupervisor: "",
    idRevisor1: "",
    idRevisor2: "",
  });

  // sugerencias
  const [suggestions, setSuggestions] = useState({
    idStudent: [],
    idSupervisor: [],
    idRevisor1: [],
    idRevisor2: [],
  });

  const roleByField = {
    idSupervisor: "supervisor",
    idRevisor1: "revisor",
    idRevisor2: "revisor",
  };

  /* ───── contextos ──────────────────────────────────────────── */
  const {
    createDocument,
    createDocumentByUser,
    updateDocument,
    documentUserRelations,
  } = useDocuments();
  const { user } = useAuth();
  const { categories } = useCategory();
  const { users } = useUser();
  const { students } = useStudent();

  /* ───── autocompletado ─────────────────────────────────────── */
  const handleIdInputChange = (field, value) => {
    setDisplay((prev) => ({ ...prev, [field]: value }));

    // si es un número pegado tal cual, lo guardamos en el form; si no, limpiamos
    if (/^\d+$/.test(value)) {
      setValue(field, value, { shouldValidate: true });
    } else {
      setValue(field, "", { shouldValidate: true });
    }

    // generar lista de sugerencias
    if (!value) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    if (field === "idStudent") {
      const matches = students
        .filter(
          (s) =>
            String(s.idStudent).startsWith(String(value)) ||
            s.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions((prev) => ({ ...prev, idStudent: matches }));
    } else {
      const matches = users
        .filter(
          (u) =>
            u.rol === roleByField[field] &&
            (String(u.idUser).startsWith(String(value)) ||
              `${u.name} ${u.lastName ?? ""}`
                .toLowerCase()
                .includes(value.toLowerCase()))
        )
        .slice(0, 5);
      setSuggestions((prev) => ({ ...prev, [field]: matches }));
    }
  };

  const selectSuggestion = (field, item) => {
    // etiqueta amigable: "#id — nombre completo"
    const label =
      field === "idStudent"
        ? `#${item.idStudent} — ${item.name}`
        : `#${item.idUser} — ${item.name} ${item.lastName ?? ""}`.trim();

    setDisplay((prev) => ({ ...prev, [field]: label }));
    setValue(field, field === "idStudent" ? item.idStudent : item.idUser, {
      shouldValidate: true,
    });
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  };

  /* ───── efecto: precargar datos en modo edición ────────────── */
  const isEditing = !!document;
  const modalTitle = isEditing ? "Editar Recurso" : "Agregar Recurso";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  useEffect(() => {
    if (document) {
      // rellenar datos base
      reset({
        idResource: document.idResource,
        title: document.title,
        description: document.description,
        datePublication: document.datePublication.split("T")[0],
        isActive: document.isActive,
        filePath: document.filePath,
        idStudent: document.idStudent,
        idCategory: document.idCategory,
        idDirector: document.idDirector,
      });

      // mostrar etiquetas con #id — nombre
      const stu = students.find((s) => s.idStudent === +document.idStudent);
      if (stu)
        setDisplay((d) => ({ ...d, idStudent: `#${stu.idStudent} — ${stu.name}` }));

      if (documentUserRelations?.length) {
        const rels = documentUserRelations
          .filter((r) => +r.idResource === +document.idResource)
          .map((r) => ({ ...r, user: users.find((u) => u.idUser === +r.idUser) }));

        const supervisor = rels.find((r) => r.user?.rol === "supervisor");
        const revs = rels.filter((r) => r.user?.rol === "revisor");

        if (supervisor)
          setDisplay((d) => ({
            ...d,
            idSupervisor: `#${supervisor.user.idUser} — ${supervisor.user.name} ${supervisor.user.lastName ?? ""
              }`,
          }));
        if (revs[0])
          setDisplay((d) => ({
            ...d,
            idRevisor1: `#${revs[0].user.idUser} — ${revs[0].user.name} ${revs[0].user.lastName ?? ""
              }`,
          }));
        if (revs[1])
          setDisplay((d) => ({
            ...d,
            idRevisor2: `#${revs[1].user.idUser} — ${revs[1].user.name} ${revs[1].user.lastName ?? ""
              }`,
          }));

        // pre-set IDs (por si no estaban)
        if (supervisor) setValue("idSupervisor", supervisor.user.idUser);
        if (revs[0]) setValue("idRevisor1", revs[0].user.idUser);
        if (revs[1]) setValue("idRevisor2", revs[1].user.idUser);
      }
    } else {
      // modo nuevo
      reset({
        idResource: null,
        title: "",
        description: "",
        datePublication: "",
        isActive: 1,
        idStudent: null,
        idCategory: null,
        idDirector: user.idUser,
        idSupervisor: null,
        idRevisor1: null,
        idRevisor2: null,
      });
      setDisplay({
        idStudent: "",
        idSupervisor: "",
        idRevisor1: "",
        idRevisor2: "",
      });
    }
  }, [document, reset, user, students, users, documentUserRelations, setValue]);

  /* ───── envío (sin cambios) ───────────────────────────────── */
  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      /* …  (lógica de guardado idéntica a la versión anterior) … */
    } finally {
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  /* ───── render — inputs de muestra id+nombre ───────────────── */
  return (
    <div
      className="fixed inset-0 flex justify-center items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* cabecera */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#003DA5]">{modalTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            {/* icono X */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* formulario */}
        <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
          {/* … campos de título, descripción, fecha, categoría, archivos … */}

          {/* estudiante */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">ID Estudiante</label>
            <input
              type="text"
              placeholder="ID o nombre"
              className={`w-full border ${errors.idStudent ? "border-red-500" : "border-gray-300"
                } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={display.idStudent}
              onChange={(e) => handleIdInputChange("idStudent", e.target.value)}
            />
            {suggestions.idStudent.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border rounded bg-white shadow z-10 text-sm">
                {suggestions.idStudent.map((s) => (
                  <li
                    key={s.idStudent}
                    onClick={() => selectSuggestion("idStudent", s)}
                    className="px-3 py-1 hover:bg-blue-50 cursor-pointer"
                  >
                    #{s.idStudent} — {s.name}
                  </li>
                ))}
              </ul>
            )}
            {errors.idStudent && (
              <p className="text-red-500 text-xs mt-1">{errors.idStudent.message}</p>
            )}
          </div>

          {/* supervisor */}
          {/* … copia el mismo patrón de arriba para idSupervisor, idRevisor1, idRevisor2 … */}
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;
