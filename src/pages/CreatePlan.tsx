import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWorkoutPlan, saveDateWorkoutPlan } from '../api';
import WorkoutForm from '../components/WorkoutForm';
import { DateWorkout } from '../types';

const CreatePlan: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initialWorkouts, setInitialWorkouts] = useState<DateWorkout[]>([]);
  const [initialCustomExercises, setInitialCustomExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return;
      
      try {
        const plan = await getWorkoutPlan(user.id);
        setInitialWorkouts(plan.workouts);
        setInitialCustomExercises(plan.customExercises || []);
      } catch (err) {
        setError('Failed to load existing workout plan');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkoutPlan();
  }, [user]);

  const handleSave = async (workouts: DateWorkout[], customExercises: string[]) => {
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await saveDateWorkoutPlan({
        userId: user.id,
        workouts,
        customExercises
      });
      
      setSuccess('Workout plan saved successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setError('Failed to save workout plan');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-10 sm:pt-16 pb-12 md:pb-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-light">
            {initialWorkouts.length ? 'Update' : 'Create'} Workout Plan
          </h1>
          <p className="text-light-dark mt-2 text-sm sm:text-base">
            {initialWorkouts.length 
              ? 'Update your existing workout plan or create a new one.' 
              : 'Create your personalized workout plan by selecting dates and exercises.'}
          </p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}
        
        {isLoading ? (
          <div className="card flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <WorkoutForm 
            initialWorkouts={initialWorkouts}
            initialCustomExercises={initialCustomExercises}
            onSave={handleSave} 
          />
        )}
        
        {isSaving && (
          <div className="fixed inset-0 bg-dark bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-dark-light p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <p className="text-lg text-light">Saving your workout plan...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlan;