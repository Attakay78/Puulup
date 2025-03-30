import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DateWorkout, Exercise, WeekRange, WorkoutStatus } from '../types';
import { 
  Calendar, 
  Dumbbell, 
  Clock, 
  Activity, 
  User, 
  ChevronRight, 
  TrendingUp, 
  Target, 
  Flame, 
  Plus, 
  BarChart3, 
  Check, 
  X, 
  ListChecks, 
  CheckCircle 
} from 'lucide-react';
import { startOfWeek, endOfWeek, parseISO, compareAsc, isWithinInterval, startOfMonth, endOfMonth, addDays } from 'date-fns';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';
import { useWorkoutPlan, useWorkoutsForDateRange, useUpdateWorkoutStatus, useUpdateExerciseStatus, queryKeys } from '../api/queries';
import { getWorkoutsForDateRange } from '../api/index';
import { useQueryClient } from '@tanstack/react-query';

// Helper function to calculate remaining duration (exported for testing)
export const calculateRemainingDuration = (workouts: DateWorkout[]) => {
  return workouts.reduce((total, workout) => {
    return total + workout.exercises.reduce((dayTotal, exercise) => {
      // Only include exercises that are not yet completed (UNDONE status)
      // and only include exercises that have a duration property
      if (exercise.status === WorkoutStatus.UNDONE && typeof exercise.duration === 'number') {
        return dayTotal + exercise.duration;
      }
      return dayTotal;
    }, 0);
  }, 0);
};

// Update the tab types and their order
type TabType = 'calendar' | 'today' | 'weekly' | 'monthly';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [updatingWorkout, setUpdatingWorkout] = useState<string | null>(null);
  const [updatingExercise, setUpdatingExercise] = useState<{ date: string, index: number } | null>(null);
  const queryClient = useQueryClient();
  
  const [currentWeek, setCurrentWeek] = useState<WeekRange>({
    start: startOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 }),
    end: endOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 })
  });
  
  // Get current month name
  const currentMonthName = formatGMTDate(getCurrentGMTDate(), 'MMMM yyyy');
  
  // Get current week range as string
  const currentWeekRange = `${formatGMTDate(currentWeek.start, 'MMM d')} - ${formatGMTDate(currentWeek.end, 'MMM d, yyyy')}`;
  
  // Use React Query hooks
  const { 
    data: workoutPlanData,
    isLoading: isWorkoutPlanLoading,
    error: workoutPlanError
  } = useWorkoutPlan(user?.id || '', user?.planId || '');

  const {
    data: weekWorkoutsData,
    isLoading: isWeekWorkoutsLoading,
    error: weekWorkoutsError
  } = useWorkoutsForDateRange(user?.id || '', currentWeek.start, currentWeek.end);

  // Mutation hooks for updating status
  const updateWorkoutStatusMutation = useUpdateWorkoutStatus();
  const updateExerciseStatusMutation = useUpdateExerciseStatus();

  // Derived data from query results
  const workoutPlan = workoutPlanData?.workouts || [];
  const customExercises = workoutPlanData?.customExercises || [];

  
  // Sort week workouts by date before using them - memoize to prevent recalculation
  const weekWorkouts = useMemo(() => {
    return weekWorkoutsData 
      ? [...weekWorkoutsData].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
      : [];
  }, [weekWorkoutsData]);
  
  // Loading and error states
  const isLoading = isWorkoutPlanLoading || isWeekWorkoutsLoading;
  const error = workoutPlanError || weekWorkoutsError 
    ? String(workoutPlanError || weekWorkoutsError) 
    : '';

  const totalExercises = workoutPlan.reduce((total, workout) => total + workout.exercises.length, 0);
  const workoutDays = workoutPlan.length;
  
  const totalDuration = calculateRemainingDuration(workoutPlan);

  // Calculate completed workouts
  const completedWorkouts = workoutPlan.filter(workout => 
    workout.exercises.length > 0 && 
    workout.exercises.every(exercise => exercise.status === WorkoutStatus.DONE)
  ).length;

  // Calculate completed exercises
  const completedExercises = workoutPlan.reduce((total, workout) => {
    return total + workout.exercises.filter(exercise => 
      exercise.status === WorkoutStatus.DONE
    ).length;
  }, 0);

  // Get current week workouts (for analytics) - always this week regardless of calendar selection
  const getCurrentWeekWorkouts = () => {
    const today = getCurrentGMTDate();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
    
    return workoutPlan.filter(workout => {
      const workoutDate = parseISO(workout.date);
      return isWithinInterval(workoutDate, { 
        start: currentWeekStart,
        end: currentWeekEnd
      });
    });
  };
  
  // Get current month workouts for analytics
  const getCurrentMonthWorkouts = () => {
    const today = getCurrentGMTDate();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return workoutPlan.filter(workout => {
      const workoutDate = parseISO(workout.date);
      return isWithinInterval(workoutDate, { 
        start: currentMonthStart,
        end: currentMonthEnd
      });
    });
  };
  
  // Current week workouts for analytics (fixed to the actual current week)
  const currentWeekWorkouts = getCurrentWeekWorkouts();
  const currentWeekWorkoutsCount = currentWeekWorkouts.length;

  // Current month workouts for analytics
  const currentMonthWorkouts = getCurrentMonthWorkouts();
  const currentMonthWorkoutsCount = currentMonthWorkouts.length;

  // Calculate remaining duration for current week
  const currentWeekRemainingDuration = calculateRemainingDuration(currentWeekWorkouts);
  
  // Calculate remaining duration for current month
  const currentMonthRemainingDuration = calculateRemainingDuration(currentMonthWorkouts);

  // Calculate total and completed exercises for current week
  const currentWeekTotalExercises = currentWeekWorkouts.reduce(
    (total, workout) => total + workout.exercises.length, 
    0
  );
  
  const currentWeekCompletedExercises = currentWeekWorkouts.reduce(
    (total, workout) => total + workout.exercises.filter(
      exercise => exercise.status === WorkoutStatus.DONE
    ).length, 
    0
  );

  // Calculate total and completed exercises for current month
  const currentMonthTotalExercises = currentMonthWorkouts.reduce(
    (total, workout) => total + workout.exercises.length, 
    0
  );
  
  const currentMonthCompletedExercises = currentMonthWorkouts.reduce(
    (total, workout) => total + workout.exercises.filter(
      exercise => exercise.status === WorkoutStatus.DONE
    ).length, 
    0
  );

  // Calculate completion percentage for current week
  const currentWeekCompletionPercentage = currentWeekTotalExercises > 0 
    ? Math.round((currentWeekCompletedExercises / currentWeekTotalExercises) * 100) 
    : 0;
    
  // Calculate completion percentage for current month
  const currentMonthCompletionPercentage = currentMonthTotalExercises > 0 
    ? Math.round((currentMonthCompletedExercises / currentMonthTotalExercises) * 100) 
    : 0;

  const getTodayWorkout = () => {
    const today = getCurrentGMTDate();
    const todayString = formatGMTDateToISO(today);
    return workoutPlan.find(workout => workout.date === todayString);
  };

  const todayWorkout = getTodayWorkout();

  // Calculate today's workout completion
  const todayCompletionPercentage = todayWorkout ? (
    todayWorkout.exercises.length > 0 ? 
      Math.round((todayWorkout.exercises.filter(e => e.status === WorkoutStatus.DONE).length / todayWorkout.exercises.length) * 100) : 0
  ) : 0;

  const renderExerciseIcon = (exercise: DateWorkout['exercises'][0]) => {
    // Show check icon if exercise is done
    if (exercise.status === WorkoutStatus.DONE) {
      return <Check size={20} className="text-green-400" />;
    }
    
    const isCardio = exercise.type === 'Treadmill' || 
                    exercise.type === 'Cycling' || 
                    (exercise.isCustom && !exercise.sets);

    return isCardio ? <Clock size={20} className="text-primary" /> : <Dumbbell size={20} className="text-primary" />;
  };

  // Memoize the handleWeekChange function to prevent recreating it on every render
  const handleWeekChange = useCallback((newWeekStart: Date) => {
    const newWeekEnd = endOfWeek(newWeekStart, { weekStartsOn: 0 });
    setCurrentWeek({
      start: newWeekStart,
      end: newWeekEnd
    });
  }, []);

  // Prefetch adjacent weeks data for smoother week navigation
  useEffect(() => {
    if (!user?.id) return;
    
    // Prefetch the next week
    const nextWeekStart = addDays(currentWeek.start, 7);
    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 });
    
    queryClient.prefetchQuery({
      queryKey: [
        queryKeys.workoutsForDateRange, 
        user.id, 
        formatGMTDateToISO(nextWeekStart), 
        formatGMTDateToISO(nextWeekEnd)
      ],
      queryFn: () => getWorkoutsForDateRange(
        user.id, 
        formatGMTDateToISO(nextWeekStart),
        formatGMTDateToISO(nextWeekEnd)
      ),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    // Prefetch the previous week
    const prevWeekStart = addDays(currentWeek.start, -7);
    const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 0 });
    
    queryClient.prefetchQuery({
      queryKey: [
        queryKeys.workoutsForDateRange, 
        user.id, 
        formatGMTDateToISO(prevWeekStart), 
        formatGMTDateToISO(prevWeekEnd)
      ],
      queryFn: () => getWorkoutsForDateRange(
        user.id, 
        formatGMTDateToISO(prevWeekStart),
        formatGMTDateToISO(prevWeekEnd)
      ),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [currentWeek.start, user?.id, queryClient]);

  // Memoize the calendar components to prevent unnecessary rerenders
  const renderCalendarComponent = useMemo(() => (
    <WeeklyCalendar 
      weekStart={currentWeek.start}
      workouts={weekWorkouts as DateWorkout[]}
      onWeekChange={handleWeekChange}
    />
  ), [currentWeek.start, weekWorkouts, handleWeekChange]);

  // Handle toggling the entire workout status
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

  // Handle toggling a single exercise status
  const handleToggleExerciseStatus = async (date: string, index: number, exercise: Exercise) => {
    if (!user) return;
    
    // Determine new status (toggle it)
    const newStatus = exercise.status === WorkoutStatus.DONE ? WorkoutStatus.UNDONE : WorkoutStatus.DONE;
    
    setUpdatingExercise({ date: date, index: index });
    
    try {
      await updateExerciseStatusMutation.mutateAsync({
        userId: user.id,
        exerciseId: exercise.id || 0,
        status: newStatus
      });
      
    } catch (err) {
      console.error('Failed to update exercise status', err);
    } finally {
      setUpdatingExercise(null);
    }
  };

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="space-y-6">
            {/* Calendar section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg text-light">Weekly Schedule</h3>
                  </div>
              {renderCalendarComponent}
                  </div>
                </div>
        );

      case 'today':
        return todayWorkout ? (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg text-light">Today's Workout</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary bg-opacity-20 text-primary">
                      {todayWorkout.exercises.length} exercise{todayWorkout.exercises.length !== 1 ? 's' : ''}
                    </span>
                    
                    {todayCompletionPercentage > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        todayCompletionPercentage === 100 
                          ? 'bg-green-500 bg-opacity-20 text-green-400' 
                          : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`}>
                    {todayCompletionPercentage}% Complete
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {todayWorkout.exercises.map((exercise, index) => (
                    <div 
                  key={`today-${index}`}
                  className={`exercise-card relative ${
                    exercise.status === 'Done' ? 'border-green-500/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                      <div className="flex items-center">
                      <div className="mr-3">
                          {renderExerciseIcon(exercise)}
                </div>
                        <div>
                        <h4 className="font-medium text-light">{exercise.type}</h4>
                        <div className="text-xs text-light-dark mt-1">
                          {exercise.sets && exercise.reps && (
                            <span className="mr-2">{exercise.sets} sets × {exercise.reps} reps</span>
                          )}
                          {exercise.duration && (
                            <span className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {exercise.duration} min
                            </span>
                          )}
                        </div>
              </div>
            </div>

                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                          exercise.status === WorkoutStatus.DONE
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {exercise.status === WorkoutStatus.DONE ? 'Done' : 'To Do'}
                        </span>
                        <button
                          onClick={() => handleToggleExerciseStatus(todayWorkout.date, index, exercise)}
                          disabled={updatingExercise?.date === todayWorkout.date && updatingExercise?.index === index}
                          className={`p-1.5 rounded-full ${
                            exercise.status === WorkoutStatus.DONE
                              ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30'
                              : 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                          }`}
                          title={exercise.status === WorkoutStatus.DONE ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {updatingExercise?.date === todayWorkout.date && updatingExercise?.index === index ? (
                            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
                          ) : exercise.status === WorkoutStatus.DONE ? (
                            <X size={12} />
                          ) : (
                            <Check size={12} />
                          )}
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}
                  </div>
                
            {/* Mark all as complete/incomplete button - Mobile */}
            <div className="mt-6 text-center">
                  <button
                    onClick={() => handleToggleWorkoutStatus(todayWorkout)}
                    disabled={!!updatingWorkout}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center mx-auto ${
                      todayCompletionPercentage === 100
                        ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30'
                        : 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                    }`}
                  >
                    {updatingWorkout === todayWorkout.date ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin mr-2"></div>
                    Updating...
                  </span>
                    ) : todayCompletionPercentage === 100 ? (
                      <>
                        <X size={16} className="mr-2" />
                    Mark All as Incomplete
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Mark All as Complete
                      </>
                    )}
                  </button>
            </div>
          </div>
        ) : (
          <div className="card text-center p-6">
            <p className="text-light-dark mb-4">No workout scheduled for today</p>
            <Link 
              to="/create-plan" 
              className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Workout
            </Link>
          </div>
        );

      case 'weekly':
        return (
          <div className="space-y-6">
            {/* Weekly analytics */}
            <div className="card">
              <h3 className="font-medium text-lg text-light mb-1">Weekly Analytics</h3>
              <p className="text-xs text-light-dark mb-4">{currentWeekRange}</p>
              
              {currentWeekWorkoutsCount > 0 ? (
                <>
                  {/* New modern design for analytics cards */}
                  <div className="relative bg-gradient-to-br from-dark-light to-dark rounded-xl overflow-hidden p-5 mb-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                            <BarChart3 size={16} className="text-primary" />
                          </div>
                          <h4 className="font-medium text-light">Completion Progress</h4>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          currentWeekCompletionPercentage === 100 
                            ? 'bg-green-500/20 text-green-400' 
                            : currentWeekCompletionPercentage >= 75
                            ? 'bg-primary/20 text-primary'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {currentWeekCompletionPercentage}%
                        </span>
                      </div>

                      {/* Progress visualization */}
                      <div className="w-full bg-dark/50 h-2.5 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full ${
                            currentWeekCompletionPercentage === 100 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : currentWeekCompletionPercentage >= 75 
                              ? 'bg-gradient-to-r from-primary to-purple-400' 
                              : currentWeekCompletionPercentage >= 50 
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                              : 'bg-gradient-to-r from-orange-500 to-amber-400'
                          } rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${currentWeekCompletionPercentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-light-dark/80 mb-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                          <span>{currentWeekCompletedExercises} completed</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-dark-light mr-1"></div>
                          <span>{currentWeekTotalExercises - currentWeekCompletedExercises} remaining</span>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Calendar size={14} className="text-primary mr-1.5" />
                            <span className="text-xs text-light-dark">Days</span>
                          </div>
                          <p className="text-xl font-bold text-light">{currentWeekWorkoutsCount}</p>
                          <p className="text-[10px] text-light-dark mt-0.5">of 7 this week</p>
                        </div>
                        
                        <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Dumbbell size={14} className="text-blue-400 mr-1.5" />
                            <span className="text-xs text-light-dark">Exercises</span>
                          </div>
                          <p className="text-xl font-bold text-light">{currentWeekTotalExercises}</p>
                          <p className="text-[10px] text-light-dark mt-0.5">total planned</p>
                        </div>
                        
                        <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Clock size={14} className="text-secondary mr-1.5" />
                            <span className="text-xs text-light-dark">Duration</span>
                          </div>
                          <p className="text-xl font-bold text-light">{currentWeekRemainingDuration}</p>
                          <p className="text-[10px] text-light-dark mt-0.5">mins remaining</p>
                        </div>
                      </div>
                      
                      {currentWeekCompletionPercentage === 100 && (
                        <div className="mt-4 text-sm text-green-400 flex items-center justify-center bg-green-500/10 p-2 rounded-lg">
                          <CheckCircle size={16} className="mr-2" />
                          Great job! You've completed all exercises this week.
                        </div>
                      )}
                      
                      {currentWeekCompletionPercentage > 0 && currentWeekCompletionPercentage < 100 && (
                        <div className="mt-4 text-sm text-primary flex items-center justify-center bg-primary/10 p-2 rounded-lg">
                          <Activity size={16} className="mr-2" />
                          Keep going! You're making good progress.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Link 
                      to="/workouts" 
                      className="inline-flex items-center text-primary text-sm hover:text-secondary transition-colors"
                    >
                      View All Workouts <ChevronRight size={16} />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <p className="text-light-dark mb-3">No workouts scheduled for this week</p>
                <Link 
                  to="/create-plan" 
                  className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                    Create a Plan
                </Link>
              </div>
            )}
            </div>
          </div>
        );

      case 'monthly':
        return (
          <div className="space-y-6">
            {/* Monthly analytics */}
          <div className="card">
              <h3 className="font-medium text-lg text-light mb-1">Monthly Analytics</h3>
              <p className="text-xs text-light-dark mb-4">{currentMonthName}</p>
              
              {currentMonthWorkoutsCount > 0 ? (
                <>
                  {/* New modern design for monthly analytics */}
                  <div className="relative bg-gradient-to-br from-dark-light to-dark rounded-xl overflow-hidden p-5 mb-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                            <BarChart3 size={16} className="text-primary" />
                          </div>
                          <h4 className="font-medium text-light">Monthly Progress</h4>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          currentMonthCompletionPercentage === 100 
                            ? 'bg-green-500/20 text-green-400' 
                            : currentMonthCompletionPercentage >= 75
                            ? 'bg-primary/20 text-primary'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {currentMonthCompletionPercentage}%
                        </span>
                      </div>

                      {/* Progress visualization */}
                      <div className="w-full bg-dark/50 h-2.5 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full ${
                            currentMonthCompletionPercentage === 100 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : currentMonthCompletionPercentage >= 75 
                              ? 'bg-gradient-to-r from-primary to-purple-400' 
                              : currentMonthCompletionPercentage >= 50 
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                              : 'bg-gradient-to-r from-orange-500 to-amber-400'
                          } rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${currentMonthCompletionPercentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-light-dark/80 mb-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                          <span>{currentMonthCompletedExercises} completed</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-dark-light mr-1"></div>
                          <span>{currentMonthTotalExercises - currentMonthCompletedExercises} remaining</span>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Calendar size={14} className="text-primary mr-1.5" />
                            <span className="text-xs text-light-dark">Days</span>
                          </div>
                          <p className="text-xl font-bold text-light">{currentMonthWorkoutsCount}</p>
                          <p className="text-[10px] text-light-dark mt-0.5">this month</p>
                        </div>
                        
                        <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Dumbbell size={14} className="text-blue-400 mr-1.5" />
                            <span className="text-xs text-light-dark">Exercises</span>
                          </div>
                          <p className="text-xl font-bold text-light">{currentMonthTotalExercises}</p>
                          <p className="text-[10px] text-light-dark mt-0.5">total planned</p>
                        </div>
                        
                        <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Clock size={14} className="text-secondary mr-1.5" />
                            <span className="text-xs text-light-dark">Duration</span>
                          </div>
                          <p className="text-xl font-bold text-light">{currentMonthRemainingDuration}</p>
                          <p className="text-[10px] text-light-dark mt-0.5">mins remaining</p>
                        </div>
                      </div>
                      
                      {currentMonthCompletionPercentage === 100 && (
                        <div className="mt-4 text-sm text-green-400 flex items-center justify-center bg-green-500/10 p-2 rounded-lg">
                          <CheckCircle size={16} className="mr-2" />
                          Excellent! You've completed all exercises this month.
                        </div>
                      )}
                      
                      {currentMonthCompletionPercentage >= 75 && currentMonthCompletionPercentage < 100 && (
                        <div className="mt-4 text-sm text-primary flex items-center justify-center bg-primary/10 p-2 rounded-lg">
                          <Activity size={16} className="mr-2" />
                          Almost there! Just a few more exercises to go.
                        </div>
                      )}
                      
                      {currentMonthCompletionPercentage >= 50 && currentMonthCompletionPercentage < 75 && (
                        <div className="mt-4 text-sm text-yellow-400 flex items-center justify-center bg-yellow-500/10 p-2 rounded-lg">
                          <Activity size={16} className="mr-2" />
                          Good progress! Keep up the momentum.
                        </div>
                      )}
                      
                      {currentMonthCompletionPercentage > 0 && currentMonthCompletionPercentage < 50 && (
                        <div className="mt-4 text-sm text-orange-400 flex items-center justify-center bg-orange-500/10 p-2 rounded-lg">
                          <Activity size={16} className="mr-2" />
                          You've started! Keep pushing forward.
                        </div>
                      )}
                    </div>
                  </div>
            
                  <div className="mt-4 text-center">
                    <Link 
                      to="/workouts" 
                      className="inline-flex items-center text-primary text-sm hover:text-secondary transition-colors"
                    >
                      View All Workouts <ChevronRight size={16} />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <p className="text-light-dark mb-3">No workouts scheduled for this month</p>
                  <Link 
                    to="/create-plan" 
                    className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Create a Plan
                  </Link>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-8 sm:pt-16 pb-12 md:pb-12 pb-24">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-white/20"
              />
            ) : (
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center">
                <User size={24} className="text-white sm:hidden" />
                <User size={32} className="text-white hidden sm:block" />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm sm:text-base text-white/80">Ready for today's workout?</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="card flex items-center justify-center py-6 sm:py-8 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Tabs */}
            <div className="md:hidden">
              <div className="bg-dark-light rounded-xl p-2 flex flex-wrap justify-between mb-6">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg text-xs font-medium ${
                    activeTab === 'calendar' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <Calendar size={14} className="mr-1" />
                  Calendar
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg text-xs font-medium ${
                    activeTab === 'today' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <Activity size={14} className="mr-1" />
                  Today
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg text-xs font-medium ${
                    activeTab === 'weekly' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <BarChart3 size={14} className="mr-1" />
                  Weekly
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg text-xs font-medium ${
                    activeTab === 'monthly' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <Calendar size={14} className="mr-1" />
                  Monthly
                </button>
              </div>
              
              <div className="mt-6">
                {renderMobileContent()}
              </div>
            </div>

            {/* Desktop Layout - Hidden on mobile */}
            <div className="hidden md:flex md:flex-col md:space-y-6">
              {/* Calendar/Weekly Schedule Section */}
              <div className="bg-dark-light rounded-xl sm:rounded-2xl border border-white/5">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
                  <h2 className="text-lg sm:text-xl font-bold text-light flex items-center">
                    <Calendar size={20} className="text-primary mr-2 sm:hidden" />
                    <Calendar size={24} className="text-primary mr-2 hidden sm:block" />
                    Weekly Schedule
                  </h2>
                  </div>

                <div className="p-4 sm:p-6">
                  {renderCalendarComponent}
                      </div>
                  </div>

              {/* Today's Workout Section */}
              {todayWorkout ? (
                <div className="bg-dark-light rounded-xl sm:rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
                      <h2 className="text-lg sm:text-xl font-bold text-light flex items-center">
                      <Activity size={20} className="text-primary mr-2 sm:hidden" />
                      <Activity size={24} className="text-primary mr-2 hidden sm:block" />
                        Today's Workout
                      </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary bg-opacity-20 text-primary">
                        {todayWorkout.exercises.length} exercise{todayWorkout.exercises.length !== 1 ? 's' : ''}
                      </span>
                      {todayCompletionPercentage > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          todayCompletionPercentage === 100 
                            ? 'bg-green-500 bg-opacity-20 text-green-400' 
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {todayCompletionPercentage}% Complete
                        </span>
                      )}
                    </div>
                      </div>
                    
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                      {todayWorkout.exercises.map((exercise, index) => (
                        <div 
                          key={`today-${index}`}
                          className={`exercise-card relative ${
                            exercise.status === 'Done' ? 'border-green-500/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                          <div className="flex items-center">
                              <div className="mr-3">
                              {renderExerciseIcon(exercise)}
                            </div>
                            <div>
                                <h4 className="font-medium text-light">{exercise.type}</h4>
                                <div className="text-xs text-light-dark mt-1">
                              {exercise.sets && exercise.reps && (
                                    <span className="mr-2">{exercise.sets} sets × {exercise.reps} reps</span>
                              )}
                              {exercise.duration && (
                                    <span className="flex items-center">
                                      <Clock size={12} className="mr-1" />
                                      {exercise.duration} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                                exercise.status === WorkoutStatus.DONE
                                  ? 'bg-green-500 bg-opacity-20 text-green-400'
                                  : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                              }`}>
                                {exercise.status === WorkoutStatus.DONE ? 'Done' : 'To Do'}
                              </span>
                              <button
                                onClick={() => handleToggleExerciseStatus(todayWorkout.date, index, exercise)}
                                disabled={updatingExercise?.date === todayWorkout.date && updatingExercise?.index === index}
                                className={`p-1.5 rounded-full ${
                                  exercise.status === WorkoutStatus.DONE
                                    ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30'
                                    : 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                                }`}
                                title={exercise.status === WorkoutStatus.DONE ? 'Mark as incomplete' : 'Mark as complete'}
                              >
                                {updatingExercise?.date === todayWorkout.date && updatingExercise?.index === index ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></div>
                                ) : exercise.status === WorkoutStatus.DONE ? (
                                  <X size={12} />
                                ) : (
                                  <Check size={12} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Mark all as complete/incomplete button */}
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => handleToggleWorkoutStatus(todayWorkout)}
                        disabled={!!updatingWorkout}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center mx-auto ${
                          todayCompletionPercentage === 100
                            ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30'
                            : 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                        }`}
                      >
                        {updatingWorkout === todayWorkout.date ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin mr-2"></div>
                            Updating...
                          </span>
                        ) : todayCompletionPercentage === 100 ? (
                          <>
                            <X size={16} className="mr-2" />
                            Mark All as Incomplete
                          </>
                        ) : (
                          <>
                            <Check size={16} className="mr-2" />
                            Mark All as Complete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-light rounded-xl sm:rounded-2xl border border-white/5 text-center p-6">
                  <p className="text-light-dark mb-4">No workout scheduled for today</p>
                  <Link 
                    to="/create-plan" 
                    className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Workout
                  </Link>
                  </div>
                )}

              {/* Weekly Analytics */}
                <div className="bg-dark-light rounded-xl sm:rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-light flex items-center">
                        <BarChart3 size={20} className="text-primary mr-2 sm:hidden" />
                        <BarChart3 size={24} className="text-primary mr-2 hidden sm:block" />
                        Weekly Analytics
                      </h2>
                      <p className="text-xs text-light-dark mt-1">{currentWeekRange}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                  {currentWeekWorkoutsCount > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Desktop Weekly Analytics - New Modern Design */}
                      <div className="relative bg-gradient-to-br from-dark-light to-dark rounded-xl overflow-hidden p-5">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                                <BarChart3 size={16} className="text-primary" />
                              </div>
                              <h4 className="font-medium text-light">Completion Progress</h4>
                            </div>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              currentWeekCompletionPercentage === 100 
                                ? 'bg-green-500/20 text-green-400' 
                                : currentWeekCompletionPercentage >= 75
                                ? 'bg-primary/20 text-primary'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {currentWeekCompletionPercentage}%
                            </span>
                          </div>

                          {/* Progress visualization */}
                          <div className="w-full bg-dark/50 h-2.5 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full ${
                                currentWeekCompletionPercentage === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                  : currentWeekCompletionPercentage >= 75 
                                  ? 'bg-gradient-to-r from-primary to-purple-400' 
                                  : currentWeekCompletionPercentage >= 50 
                                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                                  : 'bg-gradient-to-r from-orange-500 to-amber-400'
                              } rounded-full transition-all duration-500 ease-out`}
                              style={{ width: `${currentWeekCompletionPercentage}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-light-dark/80 mb-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                              <span>{currentWeekCompletedExercises} completed</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-dark-light mr-1"></div>
                              <span>{currentWeekTotalExercises - currentWeekCompletedExercises} remaining</span>
                            </div>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Calendar size={14} className="text-primary mr-1.5" />
                                <span className="text-xs text-light-dark">Days</span>
                              </div>
                              <p className="text-xl font-bold text-light">{currentWeekWorkoutsCount}</p>
                              <p className="text-[10px] text-light-dark mt-0.5">of 7 this week</p>
                            </div>
                            
                            <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Dumbbell size={14} className="text-blue-400 mr-1.5" />
                                <span className="text-xs text-light-dark">Exercises</span>
                              </div>
                              <p className="text-xl font-bold text-light">{currentWeekTotalExercises}</p>
                              <p className="text-[10px] text-light-dark mt-0.5">total planned</p>
                            </div>
                            
                            <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Clock size={14} className="text-secondary mr-1.5" />
                                <span className="text-xs text-light-dark">Duration</span>
                              </div>
                              <p className="text-xl font-bold text-light">{currentWeekRemainingDuration}</p>
                              <p className="text-[10px] text-light-dark mt-0.5">mins remaining</p>
                            </div>
                          </div>
                          
                          {currentWeekCompletionPercentage === 100 && (
                            <div className="mt-4 text-sm text-green-400 flex items-center justify-center bg-green-500/10 p-2 rounded-lg">
                              <CheckCircle size={16} className="mr-2" />
                              Great job! You've completed all exercises this week.
                            </div>
                          )}
                          
                          {currentWeekCompletionPercentage > 0 && currentWeekCompletionPercentage < 100 && (
                            <div className="mt-4 text-sm text-primary flex items-center justify-center bg-primary/10 p-2 rounded-lg">
                              <Activity size={16} className="mr-2" />
                              Keep going! You're making good progress.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-light-dark mb-4">No workouts scheduled for this week</p>
                    <Link 
                        to="/create-plan" 
                        className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
                    >
                        <Plus size={16} className="mr-2" />
                        Create a Plan
                    </Link>
                    </div>
                  )}
                  </div>
                </div>

              {/* Monthly Analytics Section */}
              <div className="bg-dark-light rounded-xl sm:rounded-2xl border border-white/5">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-light flex items-center">
                      <Calendar size={20} className="text-primary mr-2 sm:hidden" />
                      <Calendar size={24} className="text-primary mr-2 hidden sm:block" />
                      Monthly Progress
                    </h2>
                    <p className="text-xs text-light-dark mt-1">{currentMonthName}</p>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  {currentMonthWorkoutsCount > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Desktop Monthly Analytics - New Modern Design */}
                      <div className="relative bg-gradient-to-br from-dark-light to-dark rounded-xl overflow-hidden p-5">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                                <BarChart3 size={16} className="text-primary" />
                              </div>
                              <h4 className="font-medium text-light">Monthly Progress</h4>
                            </div>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              currentMonthCompletionPercentage === 100 
                                ? 'bg-green-500/20 text-green-400' 
                                : currentMonthCompletionPercentage >= 75
                                ? 'bg-primary/20 text-primary'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {currentMonthCompletionPercentage}%
                            </span>
                          </div>

                          {/* Progress visualization */}
                          <div className="w-full bg-dark/50 h-2.5 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full ${
                                currentMonthCompletionPercentage === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                  : currentMonthCompletionPercentage >= 75 
                                  ? 'bg-gradient-to-r from-primary to-purple-400' 
                                  : currentMonthCompletionPercentage >= 50 
                                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                                  : 'bg-gradient-to-r from-orange-500 to-amber-400'
                              } rounded-full transition-all duration-500 ease-out`}
                              style={{ width: `${currentMonthCompletionPercentage}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-light-dark/80 mb-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                              <span>{currentMonthCompletedExercises} completed</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-dark-light mr-1"></div>
                              <span>{currentMonthTotalExercises - currentMonthCompletedExercises} remaining</span>
                            </div>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Calendar size={14} className="text-primary mr-1.5" />
                                <span className="text-xs text-light-dark">Days</span>
                              </div>
                              <p className="text-xl font-bold text-light">{currentMonthWorkoutsCount}</p>
                              <p className="text-[10px] text-light-dark mt-0.5">this month</p>
                            </div>
                            
                            <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Dumbbell size={14} className="text-blue-400 mr-1.5" />
                                <span className="text-xs text-light-dark">Exercises</span>
                              </div>
                              <p className="text-xl font-bold text-light">{currentMonthTotalExercises}</p>
                              <p className="text-[10px] text-light-dark mt-0.5">total planned</p>
                            </div>
                            
                            <div className="bg-dark/30 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Clock size={14} className="text-secondary mr-1.5" />
                                <span className="text-xs text-light-dark">Duration</span>
                              </div>
                              <p className="text-xl font-bold text-light">{currentMonthRemainingDuration}</p>
                              <p className="text-[10px] text-light-dark mt-0.5">mins remaining</p>
                            </div>
                          </div>
                          
                          {currentMonthCompletionPercentage === 100 && (
                            <div className="mt-4 text-sm text-green-400 flex items-center justify-center bg-green-500/10 p-2 rounded-lg">
                              <CheckCircle size={16} className="mr-2" />
                              Excellent! You've completed all exercises this month.
                            </div>
                          )}
                          
                          {currentMonthCompletionPercentage >= 75 && currentMonthCompletionPercentage < 100 && (
                            <div className="mt-4 text-sm text-primary flex items-center justify-center bg-primary/10 p-2 rounded-lg">
                              <Activity size={16} className="mr-2" />
                              Almost there! Just a few more exercises to go.
                            </div>
                          )}
                          
                          {currentMonthCompletionPercentage >= 50 && currentMonthCompletionPercentage < 75 && (
                            <div className="mt-4 text-sm text-yellow-400 flex items-center justify-center bg-yellow-500/10 p-2 rounded-lg">
                              <Activity size={16} className="mr-2" />
                              Good progress! Keep up the momentum.
                            </div>
                          )}
                          
                          {currentMonthCompletionPercentage > 0 && currentMonthCompletionPercentage < 50 && (
                            <div className="mt-4 text-sm text-orange-400 flex items-center justify-center bg-orange-500/10 p-2 rounded-lg">
                              <Activity size={16} className="mr-2" />
                              You've started! Keep pushing forward.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-light-dark mb-4">No workouts scheduled for this month</p>
                    <Link 
                      to="/create-plan" 
                      className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Create a Plan
                    </Link>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;