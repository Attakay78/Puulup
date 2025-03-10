import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWorkoutPlan, getWorkoutsForDateRange } from '../api';
import { DateWorkout, WeekRange } from '../types';
import { Calendar, Dumbbell, Clock, Activity, User, ChevronRight, TrendingUp, Target, Flame, Plus, BarChart3 } from 'lucide-react';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';

type TabType = 'analytics' | 'today' | 'weekly';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<DateWorkout[]>([]);
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  
  const [currentWeek, setCurrentWeek] = useState<WeekRange>({
    start: startOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 }),
    end: endOfWeek(getCurrentGMTDate(), { weekStartsOn: 0 })
  });
  
  const [weekWorkouts, setWeekWorkouts] = useState<DateWorkout[]>([]);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return;
      
      try {
        const plan = await getWorkoutPlan(user.id);
        setWorkoutPlan(plan.workouts);
        setCustomExercises(plan.customExercises || []);
        
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

  const totalExercises = workoutPlan.reduce((total, workout) => total + workout.exercises.length, 0);
  const workoutDays = workoutPlan.length;
  
  const totalDuration = workoutPlan.reduce((total, workout) => {
    return total + workout.exercises.reduce((dayTotal, exercise) => {
      if (typeof exercise.duration === 'number') {
        return dayTotal + exercise.duration;
      }
      else if (typeof exercise.sets === 'number') {
        return dayTotal + (exercise.sets * 2);
      }
      return dayTotal;
    }, 0);
  }, 0);

  const getTodayWorkout = () => {
    const today = getCurrentGMTDate();
    const todayString = formatGMTDateToISO(today);
    return workoutPlan.find(workout => workout.date === todayString);
  };

  const todayWorkout = getTodayWorkout();

  const renderExerciseIcon = (exercise: DateWorkout['exercises'][0]) => {
    const isCardio = exercise.type === 'Treadmill' || 
                    exercise.type === 'Cycling' || 
                    (exercise.isCustom && !exercise.sets);

    return isCardio ? <Clock size={20} className="text-primary" /> : <Dumbbell size={20} className="text-primary" />;
  };

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-light rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-primary" />
                  </div>
                  <TrendingUp size={14} className="text-primary" />
                </div>
                <p className="text-lg font-bold text-light mb-0.5">{workoutDays}</p>
                <p className="text-[10px] text-light-dark">Workout Days</p>
              </div>

              <div className="bg-dark-light rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-secondary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                    <Dumbbell size={16} className="text-secondary" />
                  </div>
                  <Target size={14} className="text-secondary" />
                </div>
                <p className="text-lg font-bold text-light mb-0.5">{totalExercises}</p>
                <p className="text-[10px] text-light-dark">Total Exercises</p>
              </div>

              <div className="bg-dark-light rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-primary" />
                  </div>
                  <Flame size={14} className="text-primary" />
                </div>
                <p className="text-lg font-bold text-light mb-0.5">{totalDuration}</p>
                <p className="text-[10px] text-light-dark">Total Minutes</p>
              </div>

              <div className="bg-dark-light rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-secondary/10 w-8 h-8 rounded-lg flex items-center justify-center">
                    <Activity size={16} className="text-secondary" />
                  </div>
                  <ChevronRight size={14} className="text-secondary" />
                </div>
                <p className="text-lg font-bold text-light mb-0.5">{weekWorkouts.length}</p>
                <p className="text-[10px] text-light-dark">This Week</p>
              </div>
            </div>

            <div className="bg-dark-light rounded-xl p-4 border border-white/5">
              <h3 className="text-base font-semibold text-light mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link 
                  to="/workouts" 
                  className="bg-dark hover:bg-dark-light transition-colors flex items-center p-3 rounded-lg border border-white/5 hover:border-primary/20"
                >
                  <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                    <Dumbbell size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-light font-medium">View Workouts</p>
                    <p className="text-[10px] text-light-dark">See all planned workouts</p>
                  </div>
                </Link>
                
                <Link 
                  to="/create-plan" 
                  className="bg-dark hover:bg-dark-light transition-colors flex items-center p-3 rounded-lg border border-white/5 hover:border-secondary/20"
                >
                  <div className="bg-secondary/10 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                    <Calendar size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-light font-medium">Create Plan</p>
                    <p className="text-[10px] text-light-dark">Plan new workouts</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'today':
        return todayWorkout ? (
          <div className="bg-dark-light rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-light flex items-center">
                <Flame size={20} className="text-primary mr-2" />
                Today's Workout
              </h2>
              {todayWorkout.recurring && todayWorkout.recurring !== 'none' && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {todayWorkout.recurring === 'weekly' ? 'Weekly' : todayWorkout.recurring === 'biweekly' ? 'Biweekly' : 'Monthly'}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {todayWorkout.exercises.map((exercise, index) => (
                <div key={index} className="bg-dark rounded-lg p-3 border border-white/5">
                  <div className="flex items-center">
                    <div className="mr-3 bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                      {renderExerciseIcon(exercise)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-light flex items-center">
                        {exercise.type}
                        {exercise.isCustom && (
                          <span className="ml-2 text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                      </p>
                      {exercise.sets && exercise.reps && (
                        <p className="text-[10px] text-light-dark mt-0.5">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      )}
                      {exercise.duration && (
                        <p className="text-[10px] text-light-dark mt-0.5">
                          {exercise.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                workouts={weekWorkouts}
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
              
              {/* Add margin to the content container */}
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
                    <p className="text-lg sm:text-2xl font-bold text-light mb-0.5 sm:mb-1">{workoutDays}</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">Workout Days</p>
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
                    <p className="text-lg sm:text-2xl font-bold text-light mb-0.5 sm:mb-1">{totalDuration}</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">Total Minutes</p>
                  </div>

                  <div className="bg-dark-light rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="bg-secondary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Activity size={16} className="text-secondary sm:hidden" />
                        <Activity size={20} className="text-secondary hidden sm:block" />
                      </div>
                      <ChevronRight size={14} className="text-secondary sm:hidden" />
                      <ChevronRight size={16} className="text-secondary hidden sm:block" />
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-light mb-0.5 sm:mb-1">{weekWorkouts.length}</p>
                    <p className="text-[10px] sm:text-xs text-light-dark">This Week</p>
                  </div>
                </div>

                {todayWorkout && (
                  <div className="bg-dark-light rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-light flex items-center">
                        <Flame size={20} className="text-primary mr-2 sm:hidden" />
                        <Flame size={24} className="text-primary mr-2 hidden sm:block" />
                        Today's Workout
                      </h2>
                      {todayWorkout.recurring && todayWorkout.recurring !== 'none' && (
                        <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary">
                          {todayWorkout.recurring === 'weekly' ? 'Weekly' : todayWorkout.recurring === 'biweekly' ? 'Biweekly' : 'Monthly'}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {todayWorkout.exercises.map((exercise, index) => (
                        <div key={index} className="bg-dark rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5">
                          <div className="flex items-center">
                            <div className="mr-3 sm:mr-4 bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center">
                              {renderExerciseIcon(exercise)}
                            </div>
                            <div>
                              <p className="font-medium text-sm sm:text-base text-light flex items-center">
                                {exercise.type}
                                {exercise.isCustom && (
                                  <span className="ml-2 text-[10px] sm:text-xs bg-secondary/10 text-secondary px-1.5 sm:px-2 py-0.5 rounded-full">
                                    Custom
                                  </span>
                                )}
                              </p>
                              {exercise.sets && exercise.reps && (
                                <p className="text-[10px] sm:text-sm text-light-dark mt-0.5 sm:mt-1">
                                  {exercise.sets} sets × {exercise.reps} reps
                                </p>
                              )}
                              {exercise.duration && (
                                <p className="text-[10px] sm:text-sm text-light-dark mt-0.5 sm:mt-1">
                                  {exercise.duration} minutes
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      workouts={weekWorkouts}
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
                  <h3 className="text-base sm:text-lg font-semibold text-light mb-3 sm:mb-4">Quick Actions</h3>
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