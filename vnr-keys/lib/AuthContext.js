'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from './api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    let isInitialized = false;

    const initializeAuth = async () => {
      if (isInitialized) return; // Prevent multiple initializations
      isInitialized = true;

      try {
        console.log('🔄 AuthContext: Initializing authentication...');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        // Check if user is authenticated
        const isAuth = authAPI.isAuthenticated();
        console.log('🔄 AuthContext: isAuthenticated check:', isAuth);

        if (isAuth) {
          const userData = authAPI.getUserFromCookies();
          console.log('🔄 AuthContext: User data from cookies:', userData);

          if (userData) {
            // Set user immediately from cookies, then verify in background
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });

            // Verify token is still valid (in background)
            try {
              await authAPI.verifyToken();
              console.log('🔄 AuthContext: Token verified');
            } catch (error) {
              console.log('🔄 AuthContext: Token verification failed, logging out');
              // Token is invalid, logout
              authAPI.logout();
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } else {
            console.log('🔄 AuthContext: No user data found, logging out');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          console.log('🔄 AuthContext: Not authenticated, logging out');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      } finally {
        console.log('🔄 AuthContext: Initialization complete');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(credentials);
      const user = response.data.user;

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.register(userData);

      console.log('AuthContext register response:', response);

      // Registration is successful and user is automatically authenticated
      // The backend returns a token and user data
      if (response.data && response.data.user) {
        const user = response.data.user;
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });

        return {
          success: true,
          message: response.message,
          data: response.data,
          user: user
        };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Verify OTP function
  const verifyOTP = async (otpData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.verifyOTP(otpData);

      // The response structure is { data: { success, message, user, token } }
      const user = response.data.user;

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || error.error || 'OTP verification failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Get user role
  const getUserRole = () => {
    return state.user?.role;
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    getUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
