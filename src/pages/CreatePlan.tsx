import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomExercises } from '../context/CustomExercisesContext';
import WorkoutForm from '../components/WorkoutForm';
import { DateWorkout } from '../types';
import { Dumbbell } from 'lucide-react';
import { useWorkoutPlan, useSaveWorkoutPlan } from '../api/queries';
import { parseISO, compareAsc } from 'date-fns';

const CreatePlan: React.FC = () => {
  const { user } = useAuth();
  const { customExercises } = useCustomExercises();
  const navigate = useNavigate();
  const [initialWorkouts, setInitialWorkouts] = useState<DateWorkout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use React Query for fetching workout plan
  const { 
    data: workoutPlanData,
    isLoading,
    error: workoutPlanError
  } = useWorkoutPlan(user?.id || '', user?.planId || '');

  // Use mutation for saving the workout plan
  const saveWorkoutPlanMutation = useSaveWorkoutPlan();

  useEffect(() => {
    // Set initial data once query completes
    if (workoutPlanData) {
      // Sort workouts by date before setting them
      const sortedWorkouts = [...workoutPlanData.workouts].sort((a, b) => 
        compareAsc(parseISO(a.date), parseISO(b.date))
      );
      setInitialWorkouts(sortedWorkouts);
    }
  }, [workoutPlanData]);

  // Set error if query fails
  useEffect(() => {
    if (workoutPlanError) {
      setError('Failed to load existing workout plan');
      console.error(workoutPlanError);
    }
  }, [workoutPlanError]);

  const handleSave = async (
    workouts: DateWorkout[], 
    customExercises: string[],
    recurringData: { 
      recurringWorkoutDates: Record<string, Record<number, string[]>>, 
      workouts: Record<string, DateWorkout> 
    },
    newlyAddedExercises: Record<string, number[]> = {}
  ) => {
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Pre-process all workouts to include recurring dates
      const enhancedWorkouts: DateWorkout[] = [];
      const { recurringWorkoutDates, workouts: workoutsMap } = recurringData;
      
      // Filter workouts to only include dates with newly added exercises
      for (const workout of workouts) {
        const dateString = workout.date;
        const newIndices = newlyAddedExercises[dateString] || [];
        
        // If this date has newly added exercises, include only those exercises
        if (newIndices.length > 0) {
          const newExercises = workout.exercises.filter((_, index) => newIndices.includes(index));
          
          if (newExercises.length > 0) {
            enhancedWorkouts.push({
              date: dateString,
              exercises: newExercises
            });
          }
        }
      }
      
      // Handle recurring workouts by including their dates in the main workout set
      for (const baseDate of Object.keys(recurringWorkoutDates)) {
        const newIndices = newlyAddedExercises[baseDate] || [];
        
        for (const exerciseIndexStr of Object.keys(recurringWorkoutDates[baseDate])) {
          const exerciseIndex = Number(exerciseIndexStr);
          
          // Only process recurring workouts for newly added exercises
          if (newIndices.includes(exerciseIndex)) {
            const dates = recurringWorkoutDates[baseDate][exerciseIndex];
            if (dates && dates.length > 0) {
              // Get the exercise that's recurring
              const exercise = workoutsMap[baseDate].exercises[exerciseIndex];
              
              // For each recurring date, add a new workout or update existing with this exercise
              for (const date of dates) {
                // Check if this date already exists in our enhanced workouts
                const existingWorkoutIndex = enhancedWorkouts.findIndex(w => w.date === date);
                
                if (existingWorkoutIndex >= 0) {
                  // Add this exercise to the existing workout for this date
                  enhancedWorkouts[existingWorkoutIndex].exercises.push(
                    { ...exercise, recurring: undefined }  // Remove recurring flag
                  );
                } else {
                  // Create a new workout for this date with just this exercise
                  enhancedWorkouts.push({
                    date,
                    exercises: [{ ...exercise, recurring: undefined }]
                  });
                }
              }
            }
          }
        }
      }
      
      // Only save if there are any newly added exercises
      if (enhancedWorkouts.length > 0) {
        // Save all workouts in a single call with the enhanced workouts list
        await saveWorkoutPlanMutation.mutateAsync({
          userId: user.id,
          workouts: enhancedWorkouts,
          customExercises,
          planId: user.planId,
        });
        
        setSuccess('Workout plan saved successfully!');
      } else {
        setSuccess('No new exercises to save.');
      }
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Failed to save workout plan');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-6 sm:pt-10 pb-12 md:pb-12 pb-24">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center space-x-3 mb-6 sm:mb-8">
          <div className="bg-instagram-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
            <Dumbbell size={20} className="text-white sm:hidden" />
            <Dumbbell size={24} className="text-white hidden sm:block" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-light">
              {initialWorkouts.length ? 'Update' : 'Create'} Workout Plan
            </h1>
            <p className="text-light-dark mt-1 text-sm sm:text-base">
              {initialWorkouts.length 
                ? 'Update your existing workout plan or create a new one.' 
                : 'Create your personalized workout plan by selecting dates and exercises.'}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded-xl text-sm">
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