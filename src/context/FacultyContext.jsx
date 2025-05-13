import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createFacultyRequest, deleteFacultyRequest, getFacultiesRequest, updateFacultyRequest } from './../api/Faculty';

export const FacultyContext = createContext();

export const useFaculty = () => {
    const context = useContext(FacultyContext);
    if (!context) {
        throw new Error('useFaculty must be used within a FacultyProvider')
    }
    return context;
};

export const FacultyProvider = ({children}) => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(false);

    const createFaculty = async (faculty) => {
        try {
            setLoading(true);
            const res = await createFacultyRequest(faculty);
            setFaculties(prevFaculties => [...prevFaculties, res.data.faculty]);
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

    const getFaculties = useCallback(async (forceRefresh = false) => {
        if (faculties.length > 0 && !forceRefresh) return faculties;
        
        try {
            setLoading(true);
            const res = await getFacultiesRequest();
            setFaculties(res.data.faculties);
            return res.data.faculties;
        } catch(err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }

    }, [faculties.length]);

    const updateFaculty = async (id, faculty) => {
        try {
            setLoading(true);
            const res = await updateFacultyRequest(id, faculty);
            setFaculties(prevFaculties => 
                prevFaculties.map(fac => fac.idFaculty === id ? res.data.faculty : fac)
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

    const deleteFaculty = async (id) => {
        try {
            setLoading(true);
            const res = await deleteFacultyRequest(id);
            setFaculties(prevFaculties => 
                prevFaculties.filter(fac => fac.idFaculty !== id)
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

    useEffect(() => {
        getFaculties();
    }, [getFaculties]);

    return (
        <FacultyContext.Provider value={{
          faculties,
          loading,
          createFaculty,
          getFaculties,
          updateFaculty,
          deleteFaculty
        }}>
            {children}
        </FacultyContext.Provider>
    );
};
