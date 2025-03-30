import { useState } from 'react';
import { Plus, X, Dumbbell, Clock, Trash2 } from 'lucide-react';
import { ExerciseType } from '../types';
import { getAllExercises, getCustomExercises } from '../api';
import { useCustomExercises } from '../context/CustomExercisesContext';

interface CustomExerciseManagerProps {
  onExercisesChange?: (exercises: string[]) => void;
}

const CustomExerciseManager: React.FC<CustomExerciseManagerProps> = ({ 
  onExercisesChange 
}) => {
  const { 
    customExercises, 
    exerciseTypeMap, 
    refreshExercises, 
    isLoading: contextLoading, 
    error: contextError 
  } = useCustomExercises();
  
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState<'strength' | 'cardio'>('strength');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(contextError);

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
      const response = await fetch('https://karyde.com/gym/api/exercises', {
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed with status ${response.status}`);
      }
      
      // Refresh exercises from the server
      await refreshExercises();
      
      // Reset form
      setNewExerciseName('');
      setShowCustomExerciseForm(false);
      
      // Notify parent component if callback provided
      if (onExercisesChange) {
        onExercisesChange(customExercises);
      }
    } catch (err) {
      console.error('Failed to add custom exercise:', err);
      setError(`Failed to add custom exercise: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseName: string) => {
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
      
      // Make API call to get all exercises
      const allExercises = await getAllExercises();
      const exerciseToDelete = allExercises.find(
        (ex: any) => ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.is_custom
      );
      
      if (exerciseToDelete) {
        // Delete the exercise using its ID
        const response = await fetch(`https://karyde.com/gym/api/exercises/${exerciseToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed with status ${response.status}`);
        }
        
        // Refresh exercises from the server
        await refreshExercises();
        
        // Notify parent component if callback provided
        if (onExercisesChange) {
          onExercisesChange(customExercises);
        }
      } else {
        setError(`Could not find exercise "${exerciseName}" to delete.`);
      }
    } catch (err) {
      console.error('Failed to delete custom exercise:', err);
      setError(`Failed to delete custom exercise: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 w-full">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-light">My Custom Exercises</h2>
        <button
          type="button"
          onClick={() => setShowCustomExerciseForm(!showCustomExerciseForm)}
          className="text-primary hover:text-primary-light flex items-center bg-dark py-2 px-3 rounded-lg transition-colors"
          aria-label={showCustomExerciseForm ? "Cancel adding exercise" : "Add new exercise"}
        >
          {showCustomExerciseForm ? (
            <>
              <X size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Cancel</span>
            </>
          ) : (
            <>
              <Plus size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">New Exercise</span>
            </>
          )}
        </button>
      </div>
      
      {(error || contextError) && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm mb-4">
          {error || contextError}
        </div>
      )}
      
      {showCustomExerciseForm && (
        <div className="mb-5 bg-dark rounded-xl p-3 sm:p-4 border border-primary/20 shadow-lg">
          <h3 className="text-sm font-medium text-light mb-3">Create Custom Exercise</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-light mb-1.5">
                Exercise Name
              </label>
              <input
                type="text"
                className="input-field text-sm w-full py-2.5"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="e.g., Pull-ups, Yoga, Swimming"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-light mb-1.5">
                Exercise Type
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <label className="flex items-center bg-dark-light p-2 rounded-lg flex-1">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={newExerciseType === 'strength'}
                    onChange={() => setNewExerciseType('strength')}
                    disabled={isLoading}
                  />
                  <Dumbbell size={14} className="text-primary mr-1.5" />
                  <span className="text-xs text-light">Strength (sets & reps)</span>
                </label>
                <label className="flex items-center bg-dark-light p-2 rounded-lg flex-1">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={newExerciseType === 'cardio'}
                    onChange={() => setNewExerciseType('cardio')}
                    disabled={isLoading}
                  />
                  <Clock size={14} className="text-primary mr-1.5" />
                  <span className="text-xs text-light">Cardio (duration)</span>
                </label>
              </div>
            </div>
            
            <button
              type="button"
              className="bg-primary text-dark hover:bg-primary-light transition-colors w-full px-3 py-3 rounded-lg text-sm font-medium mt-2"
              onClick={handleAddCustomExercise}
              disabled={isLoading || !newExerciseName.trim()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus size={16} className="mr-2" />
                  <span>Add to My Exercises</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}
      
      {isLoading || contextLoading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-light-dark text-xs sm:text-sm">Loading custom exercises...</p>
        </div>
      ) : customExercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {customExercises.map(exercise => (
            <div 
              key={exercise}
              className="flex justify-between items-center bg-dark p-3 rounded-lg border border-dark-light hover:border-primary transition-all duration-200"
            >
              <div className="flex items-center overflow-hidden">
                <div className="flex-shrink-0 mr-2 sm:mr-3 bg-primary bg-opacity-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  {exerciseTypeMap[exercise] === 'cardio' ? (
                    <Clock size={16} className="text-primary" />
                  ) : (
                    <Dumbbell size={16} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="font-medium text-light text-sm sm:text-base truncate">{exercise}</p>
                  <p className="text-xs text-light-dark truncate">
                    {exerciseTypeMap[exercise] === 'cardio' ? 'Cardio (duration)' : 'Strength (sets & reps)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-light-dark hover:text-red-400 transition-colors ml-2 p-2 rounded-lg hover:bg-dark-light"
                onClick={() => handleDeleteExercise(exercise)}
                disabled={isLoading}
                aria-label={`Delete ${exercise}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark rounded-xl p-4 sm:p-6 text-center">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Dumbbell size={24} className="text-primary" />
          </div>
          <p className="text-light-dark mb-2">You don't have any custom exercises yet.</p>
          <p className="text-light-dark text-xs sm:text-sm">
            Create custom exercises to add to your workout plans.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomExerciseManager; 