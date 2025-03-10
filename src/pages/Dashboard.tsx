import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWorkoutPlan, getWorkoutsForDateRange } from '../api';
import { DateWorkout, WeekRange } from '../types';
import { Calendar, Dumbbell, Clock, Activity, User } from 'lucide-react';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<DateWorkout[]>([]);
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Week navigation state
  const [currentWeek, setCurrentWeek] = useState<WeekRange>({
    start: startOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 }), // Sunday
    end: endOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 }) // Saturday
  });
  
  // Current week's workouts
  const [weekWorkouts, setWeekWorkouts] = useState<DateWorkout[]>([]);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return;
      
      try {
        const plan = await getWorkoutPlan(user.id);
        setWorkoutPlan(plan.workouts);
        setCustomExercises(plan.customExercises || []);
        
        // Get workouts for current week
        const startDate = formatGMTDateToISO(currentWeek.start);
        const endDate = formatGMTDateToISO(currentWeek.end);
        const weeklyWorkouts = await getWorkoutsForDateRange(user.id, startDate, endDate);
        setWeekWorkouts(weeklyWorkouts);
      } catch (err) {
        setError('Failed to load workout plan');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkoutPlan();
  }, [user, currentWeek]);

  // Handle week navigation
  const handleWeekChange = async (newWeekStart: Date) => {
    const newWeekEnd = endOfWeek(newWeekStart, { weekStartsOn: 0 });
    setCurrentWeek({
      start: newWeekStart,
      end: newWeekEnd
    });
    
    if (user) {
      try {
        const startDate = formatGMTDateToISO(newWeekStart);
        const endDate = formatGMTDateToISO(newWeekEnd);
        const weeklyWorkouts = await getWorkoutsForDateRange(user.id, startDate, endDate);
        setWeekWorkouts(weeklyWorkouts);
      } catch (err) {
        console.error('Failed to load workouts for selected week', err);
      }
    }
  };

  // Calculate workout stats
  const totalExercises = workoutPlan.reduce((total, workout) => total + workout.exercises.length, 0);
  const workoutDays = workoutPlan.length;
  
  // Calculate total workout time
  const totalDuration = workoutPlan.reduce((total, workout) => {
    return total + workout.exercises.reduce((dayTotal, exercise) => {
      // For cardio exercises with duration property
      if (typeof exercise.duration === 'number') {
        return dayTotal + exercise.duration;
      }
      // For strength exercises with sets property, estimate 2 minutes per set
      else if (typeof exercise.sets === 'number') {
        return dayTotal + (exercise.sets * 2);
      }
      return dayTotal;
    }, 0);
  }, 0);

  // Get today's workout
  const getTodayWorkout = () => {
    const today = getCurrentGMTDate();
    const todayString = formatGMTDateToISO(today);
    return workoutPlan.find(workout => workout.date === todayString);
  };

  const todayWorkout = getTodayWorkout();

  return (
    <div className="min-h-screen bg-dark pt-6 sm:pt-10 pb-12 md:pb-12 pb-24">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-light">Dashboard</h1>
          <p className="text-light-dark mt-1">Welcome back, {user?.name}!</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="card flex items-center justify-center py-8 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Workout Stats - 4 columns on larger screens */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="card bg-primary bg-opacity-10 border border-primary border-opacity-20">
                <div className="flex items-center">
                  <div className="mr-3 sm:mr-4 bg-primary bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-light-dark">Workout Days</p>
                    <p className="text-xl sm:text-2xl font-bold text-light">{workoutDays}</p>
                  </div>
                </div>
              </div>
              
              <div className="card bg-primary bg-opacity-10 border border-primary border-opacity-20">
                <div className="flex items-center">
                  <div className="mr-3 sm:mr-4 bg-primary bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                    <Dumbbell size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-light-dark">Exercises</p>
                    <p className="text-xl sm:text-2xl font-bold text-light">{totalExercises}</p>
                  </div>
                </div>
              </div>
              
              <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-20">
                <div className="flex items-center">
                  <div className="mr-3 sm:mr-4 bg-secondary bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                    <Clock size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-light-dark">Total Time</p>
                    <p className="text-xl sm:text-2xl font-bold text-light">{totalDuration} min</p>
                  </div>
                </div>
              </div>
              
              <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-20">
                <div className="flex items-center">
                  <div className="mr-3 sm:mr-4 bg-secondary bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                    <Activity size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-light-dark">Weekly Workouts</p>
                    <p className="text-xl sm:text-2xl font-bold text-light">{weekWorkouts.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Sidebar - Hidden on mobile, shown in menu instead */}
              <div className="lg:col-span-1 order-2 lg:order-1 hidden lg:block">
                <div className="card">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-instagram-gradient flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-light truncate">{user?.name}</h2>
                      <p className="text-xs sm:text-sm text-light-dark truncate">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-dark pt-3 sm:pt-4">
                    <h3 className="font-medium mb-1 sm:mb-2 text-light text-sm sm:text-base">Contact</h3>
                    <p className="text-xs sm:text-sm text-light-dark truncate">{user?.contact}</p>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                {/* Today's Workout - Now displayed first */}
                {todayWorkout && (
                  <div className="card mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-light">Today's Workout</h2>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-base sm:text-lg text-light">
                          {formatGMTDate(parseISO(todayWorkout.date), 'EEEE, MMMM d')}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {todayWorkout.recurring && todayWorkout.recurring !== 'none' && (
                            <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
                              todayWorkout.recurring === 'weekly' 
                                ? 'bg-primary bg-opacity-20 text-primary' 
                                : 'bg-secondary bg-opacity-20 text-secondary'
                            }`}>
                              {todayWorkout.recurring === 'weekly' ? 'Weekly' : 'Biweekly'}
                            </span>
                          )}
                          <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-full">
                            {todayWorkout.exercises.length} exercise{todayWorkout.exercises.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        {todayWorkout.exercises.map((exercise, index) => (
                          <div key={index} className="exercise-card flex items-center">
                            <div className="mr-2 sm:mr-3 bg-primary bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                              {exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                               (exercise.isCustom && !exercise.sets) ? (
                                <Clock size={18} className="text-primary" />
                              ) : (
                                <Dumbbell size={18} className="text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-base sm:text-lg text-light">
                                {exercise.type}
                                {exercise.isCustom && (
                                  <span className="ml-1 sm:ml-2 text-xs bg-secondary bg-opacity-20 text-secondary px-1 sm:px-2 py-0.5 rounded-full">
                                    Custom
                                  </span>
                                )}
                              </p>
                              {exercise.sets && exercise.reps && (
                                <p className="text-xs sm:text-sm text-light-dark">
                                  {exercise.sets} sets × {exercise.reps} reps
                                </p>
                              )}
                              {exercise.duration && (
                                <p className="text-xs sm:text-sm text-light-dark">
                                  {exercise.duration} minutes
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Weekly Calendar View */}
                <div className="card">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-primary" />
                      <h2 className="text-lg sm:text-xl font-semibold text-light">Weekly Workout Plan</h2>
                    </div>
                    
                    <Link 
                      to="/create-plan" 
                      className="bg-instagram-gradient text-light px-4 py-2 rounded-xl text-xs sm:text-sm font-medium"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      {workoutPlan.length ? 'Update' : 'Create'}
                    </Link>
                  </div>
                  
                  {workoutPlan.length ? (
                    <WeeklyCalendar 
                      weekStart={currentWeek.start}
                      workouts={weekWorkouts}
                      onWeekChange={handleWeekChange}
                    />
                  ) : (
                    <div className="text-center py-10 sm:py-16 bg-dark rounded-xl">
                      <div className="inline-flex justify-center items-center w-12 h-12 sm:w-16 sm:h-16 bg-instagram-gradient rounded-full mb-3 sm:mb-4">
                        <Dumbbell size={24} className="text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-light mb-2">No workout plan yet</h3>
                      <p className="text-xs sm:text-sm text-light-dark mb-4 sm:mb-6 max-w-md mx-auto">
                        Create your first workout plan to get started on your fitness journey.
                      </p>
                      <Link 
                        to="/create-plan" 
                        className="bg-instagram-gradient inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-light"
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        Create Workout Plan
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