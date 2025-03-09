import { DayWorkout } from '../types';
import { Dumbbell, Clock } from 'lucide-react';

interface WorkoutCalendarProps {
  workouts: DayWorkout[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Create a map for easier lookup
  const workoutMap = workouts.reduce((acc, workout) => {
    acc[workout.day] = workout.exercises;
    return acc;
  }, {} as Record<string, DayWorkout['exercises']>);

  // Get day abbreviations
  const getDayAbbr = (day: string) => day.substring(0, 3);

  return (
    <div className="bg-dark-light rounded-2xl shadow-md overflow-hidden">
      <div className="p-3 sm:p-4 bg-primary text-light">
        <h3 className="text-base sm:text-lg font-semibold">Weekly Workout Schedule</h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-2 sm:p-4">
        {days.map(day => {
          const hasWorkout = !!workoutMap[day];
          const dayAbbr = getDayAbbr(day);
          
          return (
            <div key={day} className="flex flex-col items-center">
              <div 
                className={`workout-day-btn w-10 h-10 sm:w-12 sm:h-12 mb-1 sm:mb-2 ${
                  hasWorkout ? 'workout-day-btn-active' : 'workout-day-btn-inactive'
                }`}
              >
                {dayAbbr}
              </div>
              <span className="text-[10px] sm:text-xs text-light-dark hidden sm:inline">{day}</span>
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-dark">
        {days.map(day => {
          const hasWorkout = !!workoutMap[day];
          
          return (
            <div 
              key={day} 
              className={`p-3 sm:p-4 border-b border-dark ${
                hasWorkout ? 'bg-dark' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm sm:text-base text-light">{day}</h4>
                {hasWorkout ? (
                  <span className="text-[10px] sm:text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-full">
                    {workoutMap[day].length} exercise{workoutMap[day].length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs bg-dark text-light-dark px-2 py-1 rounded-full">
                    Rest day
                  </span>
                )}
              </div>
              
              {hasWorkout && (
                <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3">
                  {workoutMap[day].map((exercise, index) => (
                    <div key={index} className="exercise-card flex items-center">
                      <div className="mr-2 sm:mr-3 bg-primary bg-opacity-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                        {exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                         (exercise.isCustom && !exercise.sets) ? (
                          <Clock size={16} className="text-primary" />
                        ) : (
                          <Dumbbell size={16} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-light truncate">
                          {exercise.type}
                          {exercise.isCustom && (
                            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-secondary bg-opacity-20 text-secondary px-1 sm:px-2 py-0.5 rounded-full">
                              Custom
                            </span>
                          )}
                        </p>
                        {exercise.sets && exercise.reps && (
                          <p className="text-[10px] sm:text-xs text-light-dark">
                            {exercise.sets} sets × {exercise.reps} reps
                          </p>
                        )}
                        {exercise.duration && (
                          <p className="text-[10px] sm:text-xs text-light-dark">
                            {exercise.duration} minutes
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutCalendar;