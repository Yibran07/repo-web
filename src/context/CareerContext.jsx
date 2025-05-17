import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createCareerRequest, deleteCareerRequest, getCareersRequest, updateCareerRequest } from "../api/careers";

export const CareerContext = createContext();

export const useCareer = () => {
    const context = useContext(CareerContext);
    if (!context) {
        throw new Error('useCareer must be used within a CareerProvider')
    }
    return context;
};

export const CareerProvider = ({children}) => {
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(false);

    const createCareer = async (career) => {
        try{
            setLoading(true);
            const res = await createCareerRequest(career);
            setCareers(prevCareers => [...prevCareers, res.data.career]);
            return {
                success: true,
                data: res.data
            }
        }catch(err) {
            console.error(err);
            return {
                success: false,
                error: err
            }
        }finally{
            setLoading(false);
        }
    }

    const getCareers = useCallback(async (forceRefresh = false) => {
      if (careers.length > 0 && !forceRefresh) return careers;
      
      try {
        setLoading(true);
        const res = await getCareersRequest();
        setCareers(res.data.careers);
        return res.data.careers;
      } catch(err) {
        console.error(err);
        return [];
      } finally {
        setLoading(false);
      }
    }, [careers.length]);

    const updateCareer = async (id, career) => {
        try {
            setLoading(true);
            const res = await updateCareerRequest(id, career);
            setCareers(prevCareers => 
                prevCareers.map(car => car.idCareer === id ? res.data.career : car)
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

    const deleteCareer = async (id) => {
        try {
            setLoading(true);
            const res = await deleteCareerRequest(id);
            setCareers(prevCareers => 
                prevCareers.filter(car => car.idCareer !== id)
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
      getCareers();
    }, [getCareers]);

    return (
        <CareerContext.Provider value={{
          careers,
          loading,
          getCareers,
          createCareer,
          updateCareer,
          deleteCareer
        }}>
            {children}
        </CareerContext.Provider>
    );
};
