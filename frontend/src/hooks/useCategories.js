import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const mainCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id);

  const createCategory = async (formData) => {
    try {
      await categoryService.create(formData);
      await fetchCategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      await categoryService.update(id, formData);
      await fetchCategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryService.delete(id);
      await fetchCategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateCategoryVisibility = async (category, isVisible) => {
    const previousCategories = categories;
    setCategories((currentCategories) => currentCategories.map((currentCategory) => (
      currentCategory.id === category.id
        ? { ...currentCategory, is_visible: isVisible }
        : currentCategory
    )));

    const formData = new FormData();
    formData.append('is_visible', isVisible);
    formData.append('name', category.name || '');
    formData.append('slug', category.slug || '');

    if (category.parent_id) {
      formData.append('parent_id', category.parent_id);
    }

    try {
      await categoryService.update(category.id, formData);
      return { success: true };
    } catch (err) {
      setCategories(previousCategories);
      return { success: false, error: err.message };
    }
  };

  return {
    categories,
    mainCategories,
    subCategories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    updateCategoryVisibility,
    deleteCategory
  };
};
