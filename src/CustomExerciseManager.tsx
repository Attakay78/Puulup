import { useState } from 'react';
import { Plus, X, Dumbbell, Clock, Trash2 } from 'lucide-react';
import { ExerciseType } from '../types';
import { getAllExercises, getCustomExercises } from '../api';
import { useCustomExercises } from '../context/CustomExercisesContext';

// Import API_BASE_URL
import { API_BASE_URL } from '../api';

interface CustomExerciseManagerProps {
  onExercisesChange?: (exercises: string[]) => void;
}

const CustomExerciseManager: React.FC<CustomExerciseManagerProps> = ({ 
  onExercisesChange 
}) => {
  // ... existing code ... 

  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token from localStorage
      const authData = localStorage.getItem('gymtracker_auth');
      let token = '';
      
      if (authData) {
        const auth = JSON.parse(authData);
        token = auth.token;
      } else {
        throw new Error('Authentication token not found');
      }
      
      // Create the new exercise using fetch with auth header
      const response = await fetch(`${API_BASE_URL}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newExerciseName.trim(),
          exercise_type: newExerciseType === 'cardio' ? ExerciseType.CARDIO : ExerciseType.STRENGTH,
          is_custom: true
        }),
      });
      
      // ... rest of the code ...
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component code ...
};

export default CustomExerciseManager; 