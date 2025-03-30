import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DateWorkout, WorkoutStatus } from '../types';
import { Dumbbell, Clock, Plus, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO, compareAsc } from 'date-fns';
import { useWorkoutPlan, useUpdateWorkoutStatus, useUpdateExerciseStatus } from '../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { formatGMTDateToISO } from '../utils/dateUtils';

const Workouts: React.FC = () => {
  const { user } = useAuth();
  const [updatingWorkout, setUpdatingWorkout] = useState<string | null>(null);
  const [updatingExercise, setUpdatingExercise] = useState<{ date: string, index: number } | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  // Use React Query for data fetching
  const { 
    data: workoutPlanData,
    isLoading,
    error: workoutPlanError 
  } = useWorkoutPlan(user?.id || '', user?.planId || '');

  // Mutations for updating workout and exercise status
  const updateWorkoutStatusMutation = useUpdateWorkoutStatus();
  const updateExerciseStatusMutation = useUpdateExerciseStatus();

  // Derive workouts from query data and sort them by date
  const workouts = workoutPlanData?.workouts 
    ? [...workoutPlanData.workouts].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
    : [];
  const error = workoutPlanError ? String(workoutPlanError) : '';

  // Initialize all workouts as expanded when workouts data changes
  useEffect(() => {
    if (workouts.length > 0) {
      // Get today's date string
      const today = formatGMTDateToISO(new Date());
      
      // Create a map of workout dates to expansion state
      const initialExpandedState: Record<string, boolean> = {};
      
      // Only expand today's workout by default, or the first workout if today's not found
      workouts.forEach(workout => {
        initialExpandedState[workout.date] = workout.date === today;
      });
      
      // If today's workout wasn't found, expand the first one
      if (!initialExpandedState[today] && workouts.length > 0) {
        initialExpandedState[workouts[0].date] = true;
      }
      
      setExpandedWorkouts(initialExpandedState);
    }
  }, [workouts.length]);

  const toggleWorkoutExpansion = (date: string) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const handleToggleWorkoutStatus = async (workout: DateWorkout) => {
    if (!user) return;
    
    // Determine if all exercises are done
    const allDone = workout.exercises.every(e => e.status === WorkoutStatus.DONE);
    
    // Toggle status: If all done, mark all as undone, otherwise mark all as done
    const newStatus = allDone ? WorkoutStatus.UNDONE : WorkoutStatus.DONE;
    
    setUpdatingWorkout(workout.date);
    
    try {
      await updateWorkoutStatusMutation.mutateAsync({
        userId: user.id,
        date: workout.date,
        status: newStatus
      });
      
    } catch (err) {
      console.error('Failed to update workout status', err);
    } finally {
      setUpdatingWorkout(null);
    }
  };

  const handleToggleExerciseStatus = async (workout: DateWorkout, exerciseIndex: number, exerciseId: number) => {
    if (!user) return;
    
    // Get current exercise and determine new status (toggle it)
    const exercise = workout.exercises[exerciseIndex];
    const newStatus = exercise.status === WorkoutStatus.DONE ? WorkoutStatus.UNDONE : WorkoutStatus.DONE;
    
    setUpdatingExercise({ date: workout.date, index: exerciseIndex });
    
    try {
      await updateExerciseStatusMutation.mutateAsync({
        userId: user.id,
        exerciseId: exerciseId,
        status: newStatus
      });
   
    } catch (err) {
      console.error('Failed to update exercise status', err);
    } finally {
      setUpdatingExercise(null);
    }
  };

  const getCompletionPercentage = (workout: DateWorkout) => {
    if (workout.exercises.length === 0) return 0;
    const completedExercises = workout.exercises.filter(e => e.status === WorkoutStatus.DONE).length;
    return Math.round((completedExercises / workout.exercises.length) * 100);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Secondary header - changed from fixed to sticky */}
      <div className="sticky top-16 md:top-20 left-0 right-0 z-30 bg-dark pt-4 pb-4 shadow-md">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-light">Your Workouts</h1>
              <p className="text-light-dark mt-1">View and manage your workout schedule</p>
            </div>
            <Link 
              to="/create-plan" 
              className="bg-instagram-gradient text-light px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-base font-medium flex items-center"
            >
              <Plus size={16} className="sm:mr-1 md:block hidden" />
              <span className="md:block hidden">New Workout</span>
              <div className="md:hidden flex items-center">
                <Plus size={14} className="mr-1" />
                <span className="text-xs">New</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content with adjusted padding */}
      <div className="py-6">
        <div className="container mx-auto px-3 sm:px-4">
          {error && (
            <div className="mb-6 bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
              {error}
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
          ) : workouts.length === 0 ? (
            <div className="text-center py-10 sm:py-16 bg-dark-light rounded-xl">
              <div className="inline-flex justify-center items-center w-12 h-12 sm:w-16 sm:h-16 bg-instagram-gradient rounded-full mb-3 sm:mb-4">
                <Dumbbell size={24} className="text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-light mb-2">No workouts planned</h3>
              <p className="text-xs sm:text-sm text-light-dark mb-4 sm:mb-6 max-w-md mx-auto">
                Start by creating your first workout plan.
              </p>
              <Link 
                to="/create-plan" 
                className="bg-instagram-gradient inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-light"
              >
                <Plus size={16} className="mr-1" />
                Create Workout Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout, index) => {
                const completionPercentage = getCompletionPercentage(workout);
                const isCompleted = completionPercentage === 100;
                const isExpanded = expandedWorkouts[workout.date] || false;
                
                return (
                  <div 
                    key={index} 
                    className={`card ${isCompleted ? 'border-green-500 border-opacity-50' : ''}`}
                  >
                    <div 
                      className="flex justify-between items-center mb-4 cursor-pointer" 
                      onClick={() => toggleWorkoutExpansion(workout.date)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-base sm:text-lg text-light flex items-center">
                            {format(parseISO(workout.date), 'EEEE, MMMM d, yyyy')}
                            {isCompleted && (
                              <span className="ml-2 inline-flex items-center text-xs px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full">
                                <Check size={12} className="mr-1" />
                                Completed
                              </span>
                            )}
                          </h3>
                          <button className="ml-2 text-light-dark hover:text-primary transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-dark h-1.5 rounded-full mt-2 mb-1 overflow-hidden">
                          <div 
                            className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-primary'} rounded-full`} 
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-light-dark">
                          <span className={isCompleted ? 'text-green-400' : 'text-light-dark'}>{completionPercentage}% complete</span>
                          <span>{workout.exercises.filter(e => e.status === WorkoutStatus.DONE).length} of {workout.exercises.length} exercises</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {workout.exercises.some(e => e.recurring && e.recurring !== 'none') && (
                          <span className={`text-xs px-2 py-1 rounded-full bg-primary bg-opacity-20 text-primary mr-2`}>
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Collapsible exercise content */}
                    {isExpanded && (
                      <>
                        <div className="space-y-3">
                          {workout.exercises.map((exercise, exerciseIndex) => (
                            <div 
                              key={exerciseIndex} 
                              className={`flex items-center bg-dark rounded-xl p-3 ${
                                exercise.status === WorkoutStatus.DONE ? 'border border-green-500 border-opacity-30' : ''
                              }`}
                            >
                              <div 
                                className={`mr-3 w-10 h-10 rounded-full flex items-center justify-center ${
                                  exercise.status === WorkoutStatus.DONE 
                                    ? 'bg-green-500 bg-opacity-20' 
                                    : 'bg-primary bg-opacity-20'
                                }`}
                              >
                                {exercise.status === WorkoutStatus.DONE ? (
                                  <Check size={18} className="text-green-400" />
                                ) : (
                                  exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                                  (exercise.isCustom && !exercise.sets) ? (
                                    <Clock size={18} className="text-primary" />
                                  ) : (
                                    <Dumbbell size={18} className="text-primary" />
                                  )
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-light">
                                  {exercise.type}
                                  {exercise.isCustom && (
                                    <span className="ml-2 text-xs bg-secondary bg-opacity-20 text-secondary px-2 py-0.5 rounded-full">
                                      Custom
                                    </span>
                                  )}
                                  {exercise.recurring && exercise.recurring !== 'none' && (
                                    <span className="ml-2 text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded-full">
                                      {typeof exercise.recurring === 'number'
                                        ? `${exercise.recurring} week${exercise.recurring !== 1 ? 's' : ''}`
                                        : ''} recurring
                                    </span>
                                  )}
                                </p>
                                {exercise.sets && exercise.reps && (
                                  <p className="text-xs text-light-dark">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                )}
                                {exercise.duration && (
                                  <p className="text-xs text-light-dark">
                                    {exercise.duration} minutes
                                  </p>
                                )}
                              </div>
                              <div className="ml-2 flex items-center">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  exercise.status === WorkoutStatus.DONE
                                    ? 'bg-green-500 bg-opacity-20 text-green-400'
                                    : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                                }`}>
                                  {exercise.status === WorkoutStatus.DONE ? 'Done' : 'To Do'}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (exercise.id !== undefined) {
                                      handleToggleExerciseStatus(workout, exerciseIndex, exercise.id);
                                    }
                                  }}
                                  disabled={updatingExercise?.date === workout.date && updatingExercise?.index === exerciseIndex}
                                  className={`ml-2 p-1.5 rounded-full ${
                                    exercise.status === WorkoutStatus.DONE
                                      ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30'
                                      : 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                                  }`}
                                  title={exercise.status === WorkoutStatus.DONE ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {updatingExercise?.date === workout.date && updatingExercise?.index === exerciseIndex ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
                                  ) : exercise.status === WorkoutStatus.DONE ? (
                                    <X size={12} />
                                  ) : (
                                    <Check size={12} />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Mark complete/incomplete button - only shown when expanded */}
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => handleToggleWorkoutStatus(workout)}
                            disabled={!!updatingWorkout}
                            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center mx-auto ${
                              isCompleted
                                ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30'
                                : 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                            }`}
                          >
                            {updatingWorkout === workout.date ? (
                              <span>Updating...</span>
                            ) : isCompleted ? (
                              <>
                                <X size={16} className="mr-2" />
                                Mark as Incomplete
                              </>
                            ) : (
                              <>
                                <Check size={16} className="mr-2" />
                                Mark All as Complete
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workouts;