import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createStudentRequest, deleteStudentRequest, getStudentsRequest, updateStudentRequest } from "../api/student";

export const StudentContext = createContext();

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context;
};

export const StudentProvider = ({children}) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const createStudent = async (student) => {
        try {
            setLoading(true);
            const res = await createStudentRequest(student);
            setStudents(prevStudents => [...prevStudents, res.data.student]);
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

    const getStudents = useCallback(async (forceRefresh = false) => {
      if (students.length > 0 && !forceRefresh) return students;
      
      try {
        setLoading(true);
        const res = await getStudentsRequest();
        setStudents(res.data.students);
        return res.data.students;
      } catch(err) {
        console.error(err);
        return [];
      } finally {
        setLoading(false);
      }
    }, [students.length]);

    const updateStudent = async (id, student) => {
        try {
            setLoading(true);
            const res = await updateStudentRequest(id, student);
            setStudents(prevStudents => 
                prevStudents.map(student => student.idStudent === id ? res.data.student : student)
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
    };

    const deleteStudent = async (id) => {
        try {
            setLoading(true);
            const res = await deleteStudentRequest(id);
            setStudents(prevStudent => 
                prevStudent.filter(student => student.idStudent !== id)
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
    };

    useEffect(() => {
      getStudents();
    }, [getStudents]);

    return (
        <StudentContext.Provider value={{
          students,
          loading,
          getStudents,
          createStudent,
          updateStudent,
          deleteStudent
        }}>
            {children}
        </StudentContext.Provider>
    );
};
