import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWorkoutPlan } from '../api';
import { DateWorkout } from '../types';
import { Dumbbell, Clock, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Workouts: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<DateWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      
      try {
        const plan = await getWorkoutPlan(user.id);
        // Sort workouts by date
        const sortedWorkouts = [...plan.workouts].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setWorkouts(sortedWorkouts);
      } catch (err) {
        setError('Failed to load workouts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [user]);

  return (
    <div className="min-h-screen bg-dark pt-6 sm:pt-10 pb-12 md:pb-12 pb-24">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
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
            {workouts.map((workout, index) => (
              <div key={index} className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-base sm:text-lg text-light">
                    {format(parseISO(workout.date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {workout.recurring && workout.recurring !== 'none' && (
                    <span className={`text-xs px-2 py-1 rounded-full bg-primary bg-opacity-20 text-primary`}>
                      {workout.recurring === 'weekly' 
                        ? 'Weekly' 
                        : workout.recurring === 'biweekly'
                        ? 'Biweekly'
                        : 'Monthly'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="flex items-center bg-dark rounded-xl p-3">
                      <div className="mr-3 bg-primary bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center">
                        {exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                         (exercise.isCustom && !exercise.sets) ? (
                          <Clock size={18} className="text-primary" />
                        ) : (
                          <Dumbbell size={18} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-light">
                          {exercise.type}
                          {exercise.isCustom && (
                            <span className="ml-2 text-xs bg-secondary bg-opacity-20 text-secondary px-2 py-0.5 rounded-full">
                              Custom
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;