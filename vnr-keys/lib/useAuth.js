'use client';

import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from './AuthContext';
import { keyAPI } from './api';

// Custom hook for authentication and key management operations
export const useAuth = () => {
  return useAuthContext();
};

// Custom hook for key management operations
export const useKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, hasAnyRole } = useAuth();

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get all keys (for security and security-head)
  const getAllKeys = useCallback(async () => {
    if (!hasAnyRole(['security', 'security-head'])) {
      setError('Unauthorized to view all keys');
      return { success: false, error: 'Unauthorized' };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await keyAPI.getAllKeys();
      setKeys(response.data.keys);
      return { success: true, data: response.data.keys };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch keys';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [hasAnyRole]);

  // Get user's assigned keys (for faculty)
  const getMyKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await keyAPI.getMyKeys();
      setKeys(response.data.keys);
      return { success: true, data: response.data.keys };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch your keys';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new key (for security-head only)
  const createKey = useCallback(async (keyData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await keyAPI.createKey(keyData);
      
      // Refresh keys list
      if (user?.role === 'faculty') {
        await getMyKeys();
      } else {
        await getAllKeys();
      }
      
      return { success: true, data: response.data.key };
    } catch (error) {
      const errorMessage = error.message || 'Failed to create key';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user?.role, getMyKeys, getAllKeys]);

  // Assign key to user
  const assignKey = useCallback(async (keyId, assignTo) => {
    try {
      setLoading(true);
      setError(null);
      const response = await keyAPI.assignKey(keyId, assignTo);
      
      // Refresh keys list
      if (user?.role === 'faculty') {
        await getMyKeys();
      } else {
        await getAllKeys();
      }
      
      return { success: true, data: response.data.key };
    } catch (error) {
      const errorMessage = error.message || 'Failed to assign key';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user?.role, getMyKeys, getAllKeys]);

  // Return key
  const returnKey = useCallback(async (keyId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await keyAPI.returnKey(keyId);
      
      // Refresh keys list
      if (user?.role === 'faculty') {
        await getMyKeys();
      } else {
        await getAllKeys();
      }
      
      return { success: true, data: response.data.key };
    } catch (error) {
      const errorMessage = error.message || 'Failed to return key';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user?.role, getMyKeys, getAllKeys]);

  // Delete key (for security-head only)
  const deleteKey = useCallback(async (keyId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await keyAPI.deleteKey(keyId);
      
      // Refresh keys list
      await getAllKeys();
      
      return { success: true, data: response.data.deletedKey };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete key';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getAllKeys]);

  // Initialize keys based on user role
  const initializeKeys = useCallback(async () => {
    if (!user) return;
    
    if (user.role === 'faculty') {
      await getMyKeys();
    } else if (hasAnyRole(['security', 'security-head'])) {
      await getAllKeys();
    }
  }, [user, hasAnyRole, getMyKeys, getAllKeys]);

  return {
    keys,
    loading,
    error,
    clearError,
    getAllKeys,
    getMyKeys,
    createKey,
    assignKey,
    returnKey,
    deleteKey,
    initializeKeys,
  };
};

// Custom hook for form handling
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    setFieldValue,
    setFieldError,
    clearErrors,
    reset,
    handleSubmit,
    setIsSubmitting,
  };
};
