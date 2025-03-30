import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, isToday as isDayToday, isSameDay, addWeeks, startOfWeek, endOfWeek, parseISO, compareAsc } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Dumbbell, Clock, Check } from 'lucide-react';
import { DateWorkout, WorkoutStatus, RecurringType } from '../types';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate, isSameGMTDay } from '../utils/dateUtils';

interface WeeklyCalendarProps {
  weekStart: Date;
  workouts: DateWorkout[];
  onWeekChange: (newWeekStart: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ weekStart, workouts, onWeekChange }) => {
  // Generate array of 7 days starting from weekStart
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Sort workouts by date for consistent order
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  }, [workouts]);
  
  // State to track selected day for workout details
  const [selectedDay, setSelectedDay] = useState<Date | null>(getCurrentGMTDate());
  
  // Initialize with today's date when component mounts
  useEffect(() => {
    setSelectedDay(getCurrentGMTDate());
  }, []);
  
  const goToPreviousWeek = () => {
    onWeekChange(addDays(weekStart, -7));
  };
  
  const goToNextWeek = () => {
    onWeekChange(addDays(weekStart, 7));
  };
  
  // Get workout for a specific date
  const getWorkoutForDate = (date: Date) => {
    const dateString = formatGMTDateToISO(date);
    
    // First check for direct workout on this date
    const directWorkout = sortedWorkouts.find(workout => workout.date === dateString);
    if (directWorkout) return directWorkout;
    
    // If no direct workout, check for recurring exercises
    const recurringExercises: DateWorkout['exercises'] = [];
    
    for (const workout of sortedWorkouts) {
      // Process each exercise
      workout.exercises.forEach(exercise => {
        if (exercise.recurring && exercise.recurring !== 'none') {
          const workoutDate = parseISO(workout.date);
          
          if (typeof exercise.recurring === 'number') {
            // Check if this date is within the recurring weeks
            for (let i = 1; i <= exercise.recurring; i++) {
              const nextDate = addWeeks(workoutDate, i);
              if (format(nextDate, 'yyyy-MM-dd') === dateString) {
                recurringExercises.push(exercise);
                break;
              }
            }
          }
        }
      });
    }
    
    // If we found recurring exercises, create a synthetic workout
    if (recurringExercises.length > 0) {
      return {
        date: dateString,
        exercises: recurringExercises
      };
    }
    
    return undefined;
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = getCurrentGMTDate();
    return isSameGMTDay(date, today);
  };
  
  // Check if date is selected
  const isSelected = (date: Date) => {
    return selectedDay && isSameGMTDay(date, selectedDay);
  };
  
  // Handle day selection
  const handleDaySelect = (date: Date) => {
    // Only update if selecting a different day
    if (!selectedDay || !isSameGMTDay(date, selectedDay)) {
      setSelectedDay(date);
    }
  };
  
  // Get recurring badge class based on type
  const getRecurringBadgeClass = (recurring: RecurringType) => {
    if (recurring === 'none') return '';
    
    if (typeof recurring === 'number') {
      if (recurring === 1) {
        return 'bg-primary bg-opacity-20 text-primary';
      } else if (recurring === 2) {
        return 'bg-secondary bg-opacity-20 text-secondary';
      } else if (recurring >= 3) {
        return 'bg-green-500 bg-opacity-20 text-green-500';
      }
    }
    
    return '';
  };
  
  // Get workout completion status
  const getWorkoutCompletionStatus = (workout: DateWorkout | null | undefined) => {
    if (!workout || workout.exercises.length === 0) return null;
    
    const completedExercises = workout.exercises.filter(e => e.status === WorkoutStatus.DONE).length;
    
    if (completedExercises === 0) return 'not-started';
    if (completedExercises === workout.exercises.length) return 'completed';
    return 'in-progress';
  };

  // Calculate completion percentage
  const getCompletionPercentage = (workout: DateWorkout | null | undefined) => {
    if (!workout || workout.exercises.length === 0) return 0;
    
    const completedExercises = workout.exercises.filter(e => e.status === WorkoutStatus.DONE).length;
    return Math.round((completedExercises / workout.exercises.length) * 100);
  };
  
  return (
    <div className="rounded-xl overflow-hidden bg-dark-light border border-white/5">
      <div className="flex items-center justify-between bg-dark p-3 sm:p-4">
        <button 
          className="text-light-dark hover:text-primary"
          onClick={goToPreviousWeek}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="text-sm sm:text-base font-medium text-light">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h3>
        
        <button 
          className="text-light-dark hover:text-primary"
          onClick={goToNextWeek}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 divide-x divide-dark border-b border-dark">
        {days.map((day, index) => {
          const workout = getWorkoutForDate(day);
          const hasWorkout = !!workout;
          const exerciseCount = workout?.exercises.length || 0;
          const _isToday = isToday(day);
          const _isSelected = isSelected(day);
          const completionStatus = getWorkoutCompletionStatus(workout);
          
          return (
            <button
              key={index}
              className={`
                py-3 flex flex-col items-center justify-center relative
                ${_isSelected ? 'bg-dark' : ''}
                ${_isToday ? 'border-t-2 border-primary' : ''}
                hover:bg-dark
              `}
              onClick={() => handleDaySelect(day)}
            >
              <span className={`text-xs mb-1 ${_isToday ? 'text-primary font-semibold' : 'text-light-dark'}`}>
                {format(day, 'EEE')}
              </span>
              
              <span className={`
                flex items-center justify-center w-8 h-8 rounded-full mb-1
                ${_isSelected ? 'bg-primary text-light' : ''}
                ${_isToday && !_isSelected ? 'text-primary' : 'text-light'}
              `}>
                {format(day, 'd')}
              </span>
              
              {hasWorkout && (
                <div className="relative">
                  <div 
                    className={`
                      w-4 h-4 rounded-full flex items-center justify-center text-[8px]
                      ${completionStatus === 'completed' ? 'bg-green-500 text-dark' : 
                        completionStatus === 'in-progress' ? 'bg-yellow-500 text-dark' :
                        'bg-primary text-dark'}
                    `}
                  >
                    {completionStatus === 'completed' ? (
                      <Check size={10} />
                    ) : (
                      exerciseCount
                    )}
                  </div>
                  
                  {/* Progress ring for in-progress workouts */}
                  {completionStatus === 'in-progress' && (
                    <svg 
                      className="absolute top-0 left-0 transform -rotate-90" 
                      width="16" 
                      height="16"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${(getCompletionPercentage(workout) / 100) * 38} 38`}
                      />
                    </svg>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedDay && (
        <div className="p-3 sm:p-4">
          <h4 className="text-sm font-medium text-light mb-3">
            {formatGMTDate(selectedDay, 'EEEE, MMMM d, yyyy')}
          </h4>
          
          {(() => {
            const workout = selectedDay ? getWorkoutForDate(selectedDay) : null;
            const completionStatus = getWorkoutCompletionStatus(workout);
            const completionPercentage = getCompletionPercentage(workout);
            
            if (!workout) {
              return (
                <p className="text-xs text-light-dark py-2">No workout scheduled for this day.</p>
              );
            }
            
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xs text-light-dark mr-2">
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    </span>
                    {workout.exercises.some(e => e.recurring && e.recurring !== 'none') && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary bg-opacity-20 text-primary">
                        Has recurring exercises
                      </span>
                    )}
                  </div>
                  
                  {completionStatus && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      completionStatus === 'completed' 
                        ? 'bg-green-500 bg-opacity-20 text-green-400' 
                        : completionStatus === 'in-progress'
                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        : 'bg-gray-500 bg-opacity-20 text-gray-400'
                    }`}>
                      {completionStatus === 'completed' 
                        ? 'Completed' 
                        : completionStatus === 'in-progress'
                        ? `${completionPercentage}% Done`
                        : 'Not Started'}
                    </span>
                  )}
                </div>
                
                {/* Progress bar for exercise completion */}
                {completionStatus === 'in-progress' && (
                  <div className="w-full bg-dark h-1 rounded-full mb-3 overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs bg-dark rounded-lg p-2">
                      {exercise.status === WorkoutStatus.DONE ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <Check size={12} className="text-green-400" />
                        </div>
                      ) : exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                        (exercise.isCustom && !exercise.sets) ? (
                        <div className="w-5 h-5 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                          <Clock size={12} className="text-primary" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                          <Dumbbell size={12} className="text-primary" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className="text-light">
                          {exercise.type}
                          {exercise.recurring && exercise.recurring !== 'none' && (
                            <span className="ml-1 text-[8px] px-1 py-0.5 rounded-full bg-primary bg-opacity-20 text-primary">
                              {typeof exercise.recurring === 'number'
                                ? `${exercise.recurring}w`
                                : ''}
                            </span>
                          )}
                        </p>
                        {exercise.sets && exercise.reps && (
                          <p className="text-[10px] text-light-dark">
                            {exercise.sets} × {exercise.reps}
                          </p>
                        )}
                        {exercise.duration && (
                          <p className="text-[10px] text-light-dark">
                            {exercise.duration} min
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <span className={`text-[8px] px-1 py-0.5 rounded-full ${
                          exercise.status === WorkoutStatus.DONE
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {exercise.status === WorkoutStatus.DONE ? 'Done' : 'To Do'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;