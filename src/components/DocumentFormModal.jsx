import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useDocuments } from "../context/DocumentContext";
import { useAuth } from "../context/AuthContext";
import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext";
import { useStudent } from "../context/StudentContext";

import { showSuccessToast, showErrorToast } from "../util/toastUtils";

/*  ──────────────────────────────────────────────────────────────
    DocumentFormModal
    Mantiene el ID numérico para el backend, pero muestra el nombre
    completo al usuario cuando selecciona una sugerencia.
    ────────────────────────────────────────────────────────────── */
const DocumentFormModal = ({ isOpen, onClose, document }) => {
  /* ───── estados ───────────────────────────────────────────── */
  const [loading, setLoading] = useState(false);

  // 1) react-hook-form
  const { register, handleSubmit, reset, getValues, formState: { errors }, setValue } = useForm();

  // 2) texto que ve el usuario en los 4 campos de personas
  const [display, setDisplay] = useState({
    idStudent: "",
    idSupervisor: "",
    idRevisor1: "",
    idRevisor2: "",
  });

  // 3) sugerencias para autocompletar
  const [suggestions, setSuggestions] = useState({
    idStudent: [],
    idSupervisor: [],
    idRevisor1: [],
    idRevisor2: [],
  });

  // mapeo de roles ↔︎ campo
  const roleByField = {
    idSupervisor: "supervisor",
    idRevisor1: "revisor",
    idRevisor2: "revisor",
    // idStudent no filtra por rol
  };

  /* ───── contextos ──────────────────────────────────────────── */
  const { createDocument, createDocumentByUser, updateDocument, documentUserRelations } = useDocuments();
  const { user } = useAuth();
  const { categories } = useCategory();
  const { users } = useUser();
  const { students } = useStudent();

  /* ───── utilidades APA (sin cambios) ───────────────────────── */
  const [apaCopied, setApaCopied] = useState(false);

  const buildApaCitation = (formValues, studentsList) => {
    const student = studentsList.find((s) => s.idStudent === Number(formValues.idStudent));
    const author =
      student && student.name
        ? `${student.name} ${student.lastName || ""}`
        : "Autor,A.A.";

    const year = formValues.datePublication
      ? new Date(formValues.datePublication).getFullYear()
      : "s.f.";

    const title = formValues.title || "Título del trabajo";

    return `${author}. (${year}). ${title} [Tesis de licenciatura]. Repositorio Institucional UTRes Repo.`;
  };

  const copyApaToClipboard = async () => {
    try {
      const currentValues = getValues();
      const citation = buildApaCitation(currentValues, students);
      await navigator.clipboard.writeText(citation);
      setApaCopied(true);
      showSuccessToast("Referencia copiada");
      setTimeout(() => setApaCopied(false), 2500);
    } catch (err) {
      console.error(err);
      showErrorToast("No se pudo copiar la cita");
    }
  };

  /* ───── autocompletado ─────────────────────────────────────── */
  const handleIdInputChange = (field, value) => {
    // 1) actualizo lo que ve el usuario
    setDisplay((prev) => ({ ...prev, [field]: value }));

    // 2) si pegó un número puro, lo guardo en el form, si no, lo limpio
    if (/^\d+$/.test(value)) {
      setValue(field, value, { shouldValidate: true });
    } else {
      // evita enviar texto al backend
      setValue(field, "", { shouldValidate: true });
    }

    // 3) generar sugerencias
    if (!value) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    if (field === "idStudent") {
      const matches = students
        .filter((s) =>
          String(s.idStudent).startsWith(String(value)) ||
          s.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions((prev) => ({ ...prev, idStudent: matches }));
    } else {
      const matches = users
        .filter(
          (u) =>
            u.rol === roleByField[field] &&
            (
              String(u.idUser).startsWith(String(value)) ||
              `${u.name} ${u.lastName ?? ""}`.toLowerCase().includes(value.toLowerCase())
            )
        )
        .slice(0, 5);
      setSuggestions((prev) => ({ ...prev, [field]: matches }));
    }
  };

  const selectSuggestion = (field, item) => {
    const fullName = field === "idStudent"
      ? item.name
      : `${item.name} ${item.lastName ?? ""}`.trim();

    setDisplay((prev) => ({ ...prev, [field]: fullName }));
    setValue(field,
      field === "idStudent" ? item.idStudent : item.idUser,
      { shouldValidate: true }
    );
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  };

  /* ───── efectos: precargar datos en modo edición ───────────── */
  const isEditing = !!document;
  const modalTitle = isEditing ? "Editar Recurso" : "Agregar Recurso";
  const buttonText = isEditing ? "Actualizar" : "Guardar";

  useEffect(() => {
    if (document) {
      /* 1. datos básicos del recurso */
      reset({
        idResource: document.idResource,
        title: document.title,
        description: document.description,
        datePublication: document.datePublication.split("T")[0],
        isActive: document.isActive,
        filePath: document.filePath,
        idStudent: document.idStudent,
        idCategory: document.idCategory,
        idDirector: document.idDirector
      });

      /* 2. nombres visibles -------------------------------------------------- */
      // estudiante
      const stu = students.find(s => s.idStudent === +document.idStudent);
      if (stu) setDisplay((d) => ({ ...d, idStudent: stu.name }));

      // supervisor + revisores (vienen de relaciones)
      if (documentUserRelations && documentUserRelations.length > 0) {
        const docRels = documentUserRelations.filter(
          rel => +rel.idResource === +document.idResource
        ).map(rel => ({
          ...rel,
          userObj: users.find(u => u.idUser === +rel.idUser)
        }));

        const supervisor = docRels.find(r => r.userObj?.rol === "supervisor");
        const revs = docRels.filter(r => r.userObj?.rol === "revisor");

        if (supervisor)
          setDisplay(d => ({
            ...d,
            idSupervisor: `${supervisor.userObj.name} ${supervisor.userObj.lastName ?? ""}`
          }));

        if (revs[0])
          setDisplay(d => ({
            ...d,
            idRevisor1: `${revs[0].userObj.name} ${revs[0].userObj.lastName ?? ""}`
          }));
        if (revs[1])
          setDisplay(d => ({
            ...d,
            idRevisor2: `${revs[1].userObj.name} ${revs[1].userObj.lastName ?? ""}`
          }));

        // también actualizamos los IDs ocultos
        if (supervisor) setValue("idSupervisor", supervisor.userObj.idUser);
        if (revs[0]) setValue("idRevisor1", revs[0].userObj.idUser);
        if (revs[1]) setValue("idRevisor2", revs[1].userObj.idUser);
      }
    } else {
      /* modo nuevo */
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
  }, [document, reset, user, isEditing,
    documentUserRelations, users, students, setValue]);

  /* ───── envío ──────────────────────────────────────────────── */
  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);

      if (isEditing) {
        const updateData = { ...data, idResource: document.idResource };

        if (data.file && data.file[0]) updateData.file = data.file[0];
        if (data.image && data.image[0]) updateData.image = data.image[0];

        const result = await updateDocument(updateData);
        if (result?.success) {
          showSuccessToast("Recurso actualizado exitosamente");
          onClose();
        } else {
          showErrorToast("Error al actualizar el recurso");
        }
      } else {
        /* validación mínima de archivos */
        if (!data.file?.[0] || !data.image?.[0]) {
          showErrorToast("Por favor selecciona ambos archivos: documento principal e imagen");
          setLoading(false);
          return;
        }

        /* 1️⃣ crear el recurso ------------------------- */
        const formData = {
          title: data.title,
          description: data.description,
          datePublication: data.datePublication,
          isActive: "1",
          idStudent: String(data.idStudent),
          idCategory: String(data.idCategory),
          file: data.file[0],
          image: data.image[0]
        };

        const response = await createDocument(formData);
        if (!response?.success) {
          showErrorToast(response?.message ?? "Error al crear el recurso");
          setLoading(false);
          return;
        }

        /* 2️⃣ relaciones con usuarios ------------------ */
        const resourceId = response.data.resource.idResource;
        const toCreate = [
          createDocumentByUser(String(data.idDirector), resourceId),
          createDocumentByUser(String(data.idSupervisor), resourceId),
          createDocumentByUser(String(data.idRevisor1), resourceId),
          createDocumentByUser(String(data.idRevisor2), resourceId)
        ];
        await Promise.all(toCreate);

        showSuccessToast("Recurso creado exitosamente");
        onClose();
      }
    } catch (err) {
      console.error("Error completo:", err);
      const msg = err.response?.data?.message
        || (err.response?.status === 400
          ? "Error en la solicitud: datos inválidos"
          : "Error al procesar el recurso");
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  /* ───── render ─────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 flex justify-center items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* título y cerrar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#003DA5]">{modalTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* formulario */}
        <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
          {/* título */}
          <div>
            <label className="block text-gray-700 mb-1">Título</label>
            <input
              type="text"
              className={`w-full border ${errors.title ? "border-red-500"
                : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("title", { required: "El título es obligatorio" })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* descripción */}
          <div>
            <label className="block text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              {...register("description")}
              required
            ></textarea>
          </div>

          {/* id estudiante */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">ID Estudiante</label>
            <input
              type="text"
              placeholder="ID o nombre"
              className={`w-full border ${errors.idStudent ? "border-red-500"
                : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
            {errors.idStudent && <p className="text-red-500 text-xs mt-1">{errors.idStudent.message}</p>}
          </div>

          {/* supervisor */}
          <div className="relative">
            <label className="block text-gray-700 mb-1">ID Supervisor</label>
            <input
              type="text"
              placeholder="ID o nombre"
              className={`w-full border ${errors.idSupervisor ? "border-red-500"
                : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={display.idSupervisor}
              onChange={(e) => handleIdInputChange("idSupervisor", e.target.value)}
            />
            {suggestions.idSupervisor.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border rounded bg-white shadow z-10 text-sm">
                {suggestions.idSupervisor.map((u) => (
                  <li
                    key={u.idUser}
                    onClick={() => selectSuggestion("idSupervisor", u)}
                    className="px-3 py-1 hover:bg-blue-50 cursor-pointer"
                  >
                    #{u.idUser} — {u.name} {u.lastName ?? ""} ({u.rol})
                  </li>
                ))}
              </ul>
            )}
            {errors.idSupervisor && <p className="text-red-500 text-xs mt-1">{errors.idSupervisor.message}</p>}
          </div>

          {/* revisores */}
          <div className="grid grid-cols-2 gap-4">
            {/* revisor 1 */}
            <div className="relative">
              <label className="block text-gray-700 mb-1">ID Primer revisor</label>
              <input
                type="text"
                placeholder="ID o nombre"
                className={`w-full border ${errors.idRevisor1 ? "border-red-500"
                  : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={display.idRevisor1}
                onChange={(e) => handleIdInputChange("idRevisor1", e.target.value)}
              />
              {suggestions.idRevisor1.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border rounded bg-white shadow z-10 text-sm">
                  {suggestions.idRevisor1.map((u) => (
                    <li
                      key={u.idUser}
                      onClick={() => selectSuggestion("idRevisor1", u)}
                      className="px-3 py-1 hover:bg-blue-50 cursor-pointer"
                    >
                      #{u.idUser} — {u.name} {u.lastName ?? ""} ({u.rol})
                    </li>
                  ))}
                </ul>
              )}
              {errors.idRevisor1 && <p className="text-red-500 text-xs mt-1">{errors.idRevisor1.message}</p>}
            </div>

            {/* revisor 2 */}
            <div className="relative">
              <label className="block text-gray-700 mb-1">ID Segundo revisor</label>
              <input
                type="text"
                placeholder="ID o nombre"
                className={`w-full border ${errors.idRevisor2 ? "border-red-500"
                  : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={display.idRevisor2}
                onChange={(e) => handleIdInputChange("idRevisor2", e.target.value)}
              />
              {suggestions.idRevisor2.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border rounded bg-white shadow z-10 text-sm">
                  {suggestions.idRevisor2.map((u) => (
                    <li
                      key={u.idUser}
                      onClick={() => selectSuggestion("idRevisor2", u)}
                      className="px-3 py-1 hover:bg-blue-50 cursor-pointer"
                    >
                      #{u.idUser} — {u.name} {u.lastName ?? ""} ({u.rol})
                    </li>
                  ))}
                </ul>
              )}
              {errors.idRevisor2 && <p className="text-red-500 text-xs mt-1">{errors.idRevisor2.message}</p>}
            </div>
          </div>

          {/* fecha & categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
                {...register("datePublication")}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Categoría</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("idCategory")}
                required
              >
                <option value="">Seleccionar categoria</option>
                {categories.map((cat) => (
                  <option value={cat.idCategory} key={cat.idCategory}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* archivo */}
          <div>
            <label className="block text-gray-700 mb-1">Archivo (Imagen, Video o PDF)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.mp4"
              className={`w-full border ${errors.file ? "border-red-500"
                : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("file", { required: isEditing ? false : "Debes seleccionar un archivo" })}
            />
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
            {isEditing && document.filePath && (
              <p className="text-xs text-gray-500 mt-1">
                Archivo actual: {document.filePath.split("/").pop()}
                <br />Solo sube uno nuevo si deseas reemplazar el existente.
              </p>
            )}
          </div>

          {/* imagen */}
          <div>
            <label className="block text-gray-700 mb-1">Imagen de portada</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              className={`w-full border ${errors.image ? "border-red-500"
                : "border-gray-300"} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register("image", { required: isEditing ? false : "Debes seleccionar una imagen" })}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            {isEditing && document.imageUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Imagen actual:</p>
                <img
                  src={document.imageUrl}
                  alt="Portada actual"
                  className="h-20 object-contain border rounded"
                />
              </div>
            )}
          </div>

          {/* acciones */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#003DA5] text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Procesando..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;
