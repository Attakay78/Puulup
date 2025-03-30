import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomExercises } from '../api';
import { useAuth } from './AuthContext';

interface CustomExercisesContextType {
  customExercises: string[];
  exerciseTypeMap: Record<string, string>;
  refreshExercises: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const CustomExercisesContext = createContext<CustomExercisesContextType | undefined>(undefined);

export const CustomExercisesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [exerciseTypeMap, setExerciseTypeMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomExercises = async () => {
    // Don't try to load exercises if not authenticated
    if (!isAuthenticated) {
      setCustomExercises([]);
      setExerciseTypeMap({});
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get custom exercises from API
      const response = await getCustomExercises();
      
      // Format custom exercises and their types
      const exercises: string[] = [];
      const typeMap: Record<string, string> = {};
      
      if (response && Array.isArray(response)) {
        response.forEach(ex => {
          exercises.push(ex.name);
          typeMap[ex.name] = ex.exercise_type === 'cardio' ? 'cardio' : 'strength';
        });
      }
      
      setCustomExercises(exercises);
      setExerciseTypeMap(typeMap);
    } catch (err) {
      console.error('Failed to load custom exercises:', err);
      setError('Failed to load custom exercises');
    } finally {
      setIsLoading(false);
    }
  };

  // Load custom exercises when auth state changes
  useEffect(() => {
    // Only attempt to load exercises when auth is not in loading state and user is authenticated
    if (!authLoading) {
      loadCustomExercises();
    }
  }, [isAuthenticated, authLoading]);

  const refreshExercises = async () => {
    try {
      await loadCustomExercises();
      return true;
    } catch (error) {
      console.error('Failed to refresh exercises:', error);
      setError('Failed to refresh exercises. Please try again.');
      return false;
    }
  };

  return (
    <CustomExercisesContext.Provider
      value={{
        customExercises,
        exerciseTypeMap,
        refreshExercises,
        isLoading,
        error
      }}
    >
      {children}
    </CustomExercisesContext.Provider>
  );
};

export const useCustomExercises = (): CustomExercisesContextType => {
  const context = useContext(CustomExercisesContext);
  if (context === undefined) {
    throw new Error('useCustomExercises must be used within a CustomExercisesProvider');
  }
  return context;
}; 