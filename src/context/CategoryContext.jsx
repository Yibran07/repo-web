import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createCategoryRequest, deleteCategoryRequest, getCategoriesRequest, updateCategoryRequest } from "../api/categories";

export const CategoryContext = createContext();

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategory must be used within a CategoryProvider')
    }
    return context;
}

export const CategoryProvider = ({children}) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCategories = useCallback(async (forceRefresh = false) => {
      if (categories.length > 0 && !forceRefresh) return;
      
      try {
        setLoading(true);
        const res = await getCategoriesRequest();
        setCategories(res.data.categories);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, [categories.length]);

    const createCategory = async (category) => {
      try {
        setLoading(true);
        const res = await createCategoryRequest(category);
        setCategories(prevCategories => [...prevCategories, res.data.category]);
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

    const updateCategory = async (id, category) => {
      try {
        setLoading(true);
        const res = await updateCategoryRequest(id, category);
        setCategories(prevCategories => 
          prevCategories.map(cat => cat.idCategory === id ? res.data.category : cat)
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

    const deleteCategory = async (id) => {
      try {
        setLoading(true);
        await deleteCategoryRequest(id);
        setCategories(prevCategories => 
          prevCategories.filter(category => category.idCategory !== id)
        );
        return { success: true };
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
        getCategories();
    }, [getCategories]);

    return (
        <CategoryContext.Provider value={{
          categories,
          loading,
          getCategories,
          createCategory,
          updateCategory,
          deleteCategory
        }}>
            {children}
        </CategoryContext.Provider>
    );
};