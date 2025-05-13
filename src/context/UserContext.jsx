import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createUserRequest, deleteUserRequest, getUsersRequest, updateUserRequest } from "../api/users";

export const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context;
};

export const UserProvider = ({children}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([])

    const createUser = async (user) => {
        try {
            setLoading(true);
            const res = await createUserRequest(user);
            setUsers(prevUsers => [...prevUsers, res.data.user]);
            return {
                success: true,
                data: res.data
            };
        } catch(err) {
            if (err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response.data.message) {
                setErrors([{ message: err.response.data.message }]);
            } else {
                setErrors([{ message: "Error en el registro" }]);
            }
            return {
                success: false,
                error: err
            };
        } finally {
            setLoading(false);
        }
    }

    const getUsers = useCallback(async (forceRefresh = false) => {
      if (users.length > 0 && !forceRefresh) return users;
      
      try {
        setLoading(true);
        const res = await getUsersRequest();
        setUsers(res.data.users);
        return res.data.users;
      } catch(err) {
        console.error(err);
        return [];
      } finally {
        setLoading(false);
      }
    }, [users.length]);

    const updateUser = async (id, user) => {
        try {
            setLoading(true);
            const res = await updateUserRequest(id, user);
            setUsers(prevUsers => 
                prevUsers.map(user => user.idUser === id ? res.data.user : user)
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

    const deleteUser = async (id) => {
        try {
            setLoading(true);
            const res = await deleteUserRequest(id);
            setUsers(prevUsers => 
                prevUsers.filter(usr => usr.idUser !== id)
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
        if(errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [errors])
    
    useEffect(() => {
      getUsers();
    }, [getUsers]);

    return (
        <UserContext.Provider value={{
          users,
          loading,
          getUsers,
          createUser,
          updateUser,
          deleteUser,
          errors
        }}>
            {children}
        </UserContext.Provider>
    );
};
