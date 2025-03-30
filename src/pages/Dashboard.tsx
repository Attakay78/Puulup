import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DateWorkout, Exercise, WeekRange, WorkoutStatus } from '../types';
import { Calendar, Dumbbell, Clock, Activity, User, ChevronRight, TrendingUp, Target, Flame, Plus, BarChart3, Check, X } from 'lucide-react';
import { startOfWeek, endOfWeek, parseISO, compareAsc, isWithinInterval } from 'date-fns';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';
import { useWorkoutPlan, useWorkoutsForDateRange, useUpdateWorkoutStatus, useUpdateExerciseStatus } from '../api/queries';
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

type TabType = 'analytics' | 'today' | 'weekly';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [updatingWorkout, setUpdatingWorkout] = useState<string | null>(null);
  const [updatingExercise, setUpdatingExercise] = useState<{ date: string, index: number } | null>(null);
  const queryClient = useQueryClient();
  
  const [currentWeek, setCurrentWeek] = useState<WeekRange>({
    start: startOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 }),
    end: endOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 })
  });
  
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

  
  // Sort week workouts by date before using them
  const weekWorkouts = weekWorkoutsData 
    ? [...weekWorkoutsData].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
    : [];
  
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
  
  // Current week workouts for analytics (fixed to the actual current week)
  const currentWeekWorkouts = getCurrentWeekWorkouts();
  const currentWeekWorkoutsCount = currentWeekWorkouts.length;

  // Calculate remaining duration for current week
  const currentWeekRemainingDuration = calculateRemainingDuration(currentWeekWorkouts);

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

  // Calculate completion percentage for current week
  const currentWeekCompletionPercentage = currentWeekTotalExercises > 0 
    ? Math.round((currentWeekCompletedExercises / currentWeekTotalExercises) * 100) 
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

  const handleWeekChange = (newWeekStart: Date) => {
    const newWeekEnd = endOfWeek(newWeekStart, { weekStartsOn: 0 });
    setCurrentWeek({
      start: newWeekStart,
      end: newWeekEnd
    });
  };

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
      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Upcoming workouts summary */}
            <div className="card">
              <h3 className="font-medium text-lg text-light mb-4">This Week's Workouts</h3>
              {currentWeekWorkoutsCount > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-light-dark mb-2">
                    <span>Total workout Days</span>
                    <span className="text-light">{currentWeekWorkoutsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-light-dark mb-2">
                    <span>Remaining minutes</span>
                    <span className="text-light">{currentWeekRemainingDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-light-dark mb-4">
                    <span>Completion</span>
                    <span className="text-light">{currentWeekCompletionPercentage}%</span>
                </div>
                  
                  <div className="w-full bg-dark h-1.5 rounded-full mb-4 overflow-hidden">
                    <div 
                      className={`h-full ${currentWeekCompletionPercentage === 100 ? 'bg-green-500' : 'bg-primary'} rounded-full`} 
                      style={{ width: `${currentWeekCompletionPercentage}%` }}
                    ></div>
              </div>

                  <div className="text-center mt-4">
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

            {/* Today's workout section removed from analytics tab */}
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
                    {todayCompletionPercentage}% done
                </span>
              )}
              </div>
            </div>
            
            {/* Progress bar */}
            {todayCompletionPercentage > 0 && (
              <div className="w-full bg-dark h-1.5 rounded-full mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${todayCompletionPercentage === 100 ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${todayCompletionPercentage}%` }}
                ></div>
              </div>
            )}
            
            {/* Display recurring exercises badge */}
            {todayWorkout.exercises.some(e => e.recurring && e.recurring !== 'none') && (
              <div className="mb-4 p-2 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-10">
                <span className="text-xs text-primary">
                  Some exercises in this workout are recurring
                </span>
              </div>
            )}
            
            <div className="space-y-3">
              {todayWorkout.exercises.map((exercise, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between bg-dark rounded-xl p-3 ${
                    exercise.status === WorkoutStatus.DONE ? 'border border-green-500 border-opacity-30' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className={`mr-3 ${
                        exercise.status === WorkoutStatus.DONE 
                          ? 'bg-green-500 bg-opacity-20' 
                          : 'bg-primary bg-opacity-20'
                      } w-10 h-10 rounded-full flex items-center justify-center`}
                    >
                      {renderExerciseIcon(exercise)}
                    </div>
                    <div>
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
                              ? `${exercise.recurring} week${exercise.recurring !== 1 ? 's' : ''} recurring`
                              : ''}
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
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      exercise.status === WorkoutStatus.DONE
                        ? 'bg-green-500 bg-opacity-20 text-green-400'
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                    }`}>
                      {exercise.status === WorkoutStatus.DONE ? 'Done' : 'To Do'}
                    </span>
                    <button
                      onClick={() => handleToggleExerciseStatus(todayWorkout.date, index, exercise)}
                      disabled={updatingExercise?.date === todayWorkout.date && updatingExercise?.index === index}
                      className={`ml-2 p-1.5 rounded-full ${
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
              ))}
            </div>
            
            {/* Mark all as complete/incomplete button */}
            <div className="mt-4 text-center">
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
                  <span>Updating...</span>
                ) : todayCompletionPercentage === 100 ? (
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
            
            <div className="text-center mt-4">
              <Link 
                to="/workouts" 
                className="inline-flex items-center text-primary text-sm hover:text-secondary transition-colors"
              >
                View All Workouts <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-dark-light rounded-xl p-6 text-center border border-white/5">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Dumbbell size={24} className="text-primary" />
            </div>
            <h3 className="text-light font-medium mb-1">No Workout Today</h3>
            <p className="text-sm text-light-dark mb-4">Take a rest day or plan a new workout.</p>
            <Link 
              to="/create-plan" 
              className="bg-instagram-gradient text-white text-sm px-4 py-2 rounded-xl inline-flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Plan Workout
            </Link>
          </div>
        );

      case 'weekly':
        return (
          <div className="bg-dark-light rounded-xl border border-white/5">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-light flex items-center">
                <Calendar size={20} className="text-primary mr-2" />
                Weekly Schedule
              </h2>
            </div>
            
            <div className="p-4">
              <WeeklyCalendar 
                weekStart={currentWeek.start}
                workouts={weekWorkouts as DateWorkout[]}
                onWeekChange={handleWeekChange}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-4 sm:pt-10 pb-12 md:pb-12 pb-24">
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
            {/* Mobile Tabs - Only visible on mobile */}
            <div className="md:hidden">
              <div className="bg-dark-light rounded-xl p-2 flex justify-between mb-6">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium ${
                    activeTab === 'analytics' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <BarChart3 size={16} className="mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium ${
                    activeTab === 'today' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <Flame size={16} className="mr-2" />
                  Today
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium ${
                    activeTab === 'weekly' 
                      ? 'bg-instagram-gradient text-white' 
                      : 'text-light-dark hover:text-light'
                  }`}
                >
                  <Calendar size={16} className="mr-2" />
                  Weekly
                </button>
              </div>
              
              <div className="mt-6">
                {renderMobileContent()}
              </div>
            </div>

            {/* Desktop Layout - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-dark-light rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Calendar size={16} className="text-primary sm:hidden" />
                        <Calendar size={20} className="text-primary hidden sm:block" />
                      </div>
                      <TrendingUp size={14} className="text-primary sm:hidden" />
                      <TrendingUp size={16} className="text-primary hidden sm:block" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-light mb-0.5 sm:mb-1">{currentWeekWorkoutsCount}</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">This Week's Workouts</p>
                  </div>

                  <div className="bg-dark-light rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="bg-secondary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Dumbbell size={16} className="text-secondary sm:hidden" />
                        <Dumbbell size={20} className="text-secondary hidden sm:block" />
                      </div>
                      <Target size={14} className="text-secondary sm:hidden" />
                      <Target size={16} className="text-secondary hidden sm:block" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-light mb-0.5 sm:mb-1">{totalExercises}</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">Total Exercises</p>
                  </div>

                  <div className="bg-dark-light rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Clock size={16} className="text-primary sm:hidden" />
                        <Clock size={20} className="text-primary hidden sm:block" />
                      </div>
                      <Flame size={14} className="text-primary sm:hidden" />
                      <Flame size={16} className="text-primary hidden sm:block" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-light mb-0.5 sm:mb-1" title="Total minutes for remaining exercises">{currentWeekRemainingDuration}</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">Minutes Remaining</p>
                  </div>

                  <div className="bg-dark-light rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="bg-green-500/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <Activity size={14} className="text-green-500" />
                    </div>
                    <p className={`text-lg sm:text-2xl font-bold ${currentWeekCompletionPercentage === 100 ? 'text-green-500' : 'text-light'} mb-0.5 sm:mb-1`}>{currentWeekCompletionPercentage}%</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">Completion</p>
                  </div>
                </div>

                {/* Today's workout section removed from desktop layout */}

                <div className="bg-dark-light rounded-xl sm:rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
                    <h2 className="text-lg sm:text-xl font-bold text-light flex items-center">
                      <Calendar size={20} className="text-primary mr-2 sm:hidden" />
                      <Calendar size={24} className="text-primary mr-2 hidden sm:block" />
                      Weekly Schedule
                    </h2>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <WeeklyCalendar 
                      weekStart={currentWeek.start}
                      workouts={weekWorkouts as DateWorkout[]}
                      onWeekChange={handleWeekChange}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                <div className="bg-dark-light rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User size={20} className="text-primary sm:hidden" />
                        <User size={24} className="text-primary hidden sm:block" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-light">{user?.name}</h2>
                      <p className="text-xs sm:text-sm text-light-dark">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-dark rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5">
                      <p className="text-xs sm:text-sm text-light-dark mb-1">Contact</p>
                      <p className="text-sm sm:text-base text-light">{user?.contact}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors w-full flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                <div className="bg-dark-light rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                  <h3 className="text-base sm:text-lg font-semibold text-light mb-3  sm:mb-4">Quick Actions</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <Link 
                      to="/workouts" 
                      className="bg-dark hover:bg-dark-light transition-colors flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5 hover:border-primary/20"
                    >
                      <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3">
                        <Dumbbell size={16} className="text-primary sm:hidden" />
                        <Dumbbell size={20} className="text-primary hidden sm:block" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base text-light font-medium">View Workouts</p>
                        <p className="text-[10px] sm:text-sm text-light-dark">See all planned workouts</p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/create-plan" 
                      className="bg-dark hover:bg-dark-light transition-colors flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5 hover:border-secondary/20"
                    >
                      <div className="bg-secondary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3">
                        <Calendar size={16} className="text-secondary sm:hidden" />
                        <Calendar size={20} className="text-secondary hidden sm:block" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base text-light font-medium">Create Plan</p>
                        <p className="text-[10px] sm:text-sm text-light-dark">Plan new workouts</p>
                      </div>
                    </Link>
                  </div>
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