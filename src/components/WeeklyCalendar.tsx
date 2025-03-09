import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Dumbbell, Clock } from 'lucide-react';
import { DateWorkout } from '../types';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate, isSameGMTDay } from '../utils/dateUtils';

interface WeeklyCalendarProps {
  weekStart: Date;
  workouts: DateWorkout[];
  onWeekChange: (newWeekStart: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ weekStart, workouts, onWeekChange }) => {
  // Generate array of 7 days starting from weekStart
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // State to track selected day for workout details
  const [selectedDay, setSelectedDay] = useState<Date | null>(getCurrentGMTDate());
  
  // Initialize with today's date when component mounts
  useEffect(() => {
    setSelectedDay(getCurrentGMTDate());
  }, []);
  
  const goToPreviousWeek = () => {
    onWeekChange(addDays(weekStart, -7));
    setSelectedDay(null); // Reset selected day when changing weeks
  };
  
  const goToNextWeek = () => {
    onWeekChange(addDays(weekStart, 7));
    setSelectedDay(null); // Reset selected day when changing weeks
  };
  
  // Get workout for a specific date
  const getWorkoutForDate = (date: Date) => {
    const dateString = formatGMTDateToISO(date);
    return workouts.find(workout => workout.date === dateString);
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
    if (selectedDay && isSameGMTDay(date, selectedDay)) {
      // If clicking the same day, toggle off
      setSelectedDay(null);
    } else {
      setSelectedDay(date);
    }
  };
  
  // Get recurring badge class based on type
  const getRecurringBadgeClass = (recurring: string) => {
    switch (recurring) {
      case 'weekly':
        return 'bg-primary bg-opacity-20 text-primary';
      case 'biweekly':
        return 'bg-secondary bg-opacity-20 text-secondary';
      case 'month':
        return 'bg-green-500 bg-opacity-20 text-green-500';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-dark-light rounded-2xl shadow-md overflow-hidden">
      <div className="p-3 sm:p-4 bg-primary text-light">
        <div className="flex justify-between items-center">
          <button 
            onClick={goToPreviousWeek}
            className="p-1 rounded-full hover:bg-primary-dark transition-colors"
            aria-label="Previous week"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-base sm:text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h3>
          <button 
            onClick={goToNextWeek}
            className="p-1 rounded-full hover:bg-primary-dark transition-colors"
            aria-label="Next week"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-2 sm:p-4">
        {days.map(day => {
          const hasWorkout = !!getWorkoutForDate(day);
          const dayAbbr = format(day, 'EEE');
          const dayNum = format(day, 'd');
          const isCurrentDay = isToday(day);
          const isDaySelected = isSelected(day);
          
          return (
            <div key={day.toString()} className="flex flex-col items-center">
              <button 
                onClick={() => handleDaySelect(day)}
                className={`workout-day-btn w-10 h-10 sm:w-12 sm:h-12 mb-1 sm:mb-2 ${
                  isDaySelected ? 'bg-secondary text-light' :
                  isCurrentDay ? 'bg-primary text-light' : 
                  hasWorkout ? 'workout-day-btn-active' : 'workout-day-btn-inactive'
                }`}
                aria-label={`Select ${format(day, 'EEEE, MMMM d')}`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs">{dayAbbr}</span>
                  <span className="text-sm font-bold">{dayNum}</span>
                </div>
              </button>
              <span className="text-[10px] sm:text-xs text-light-dark hidden sm:inline">
                {format(day, 'MMM d')}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Show workout details only for selected day */}
      {selectedDay && (
        <div className="border-t border-dark">
          {(() => {
            const workout = getWorkoutForDate(selectedDay);
            const hasWorkout = !!workout;
            const dayName = format(selectedDay, 'EEEE');
            const dateDisplay = format(selectedDay, 'MMM d');
            
            return (
              <div 
                className={`p-3 sm:p-4 ${
                  isToday(selectedDay) ? 'bg-primary bg-opacity-10' : hasWorkout ? 'bg-dark' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm sm:text-base text-light">{dayName} <span className="text-light-dark text-xs">({dateDisplay})</span></h4>
                  {hasWorkout ? (
                    <div className="flex items-center space-x-2">
                      {workout.recurring && workout.recurring !== 'none' && (
                        <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
                          getRecurringBadgeClass(workout.recurring)
                        }`}>
                          {workout.recurring === 'weekly' 
                            ? 'Weekly' 
                            : workout.recurring === 'biweekly'
                            ? 'Biweekly'
                            : 'Month'}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-full">
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] sm:text-xs bg-dark text-light-dark px-2 py-1 rounded-full">
                      Rest day
                    </span>
                  )}
                </div>
                
                {hasWorkout && (
                  <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3">
                    {workout.exercises.map((exercise, index) => (
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
          })()}
        </div>
      )}
      
      {/* Instructions when no day is selected */}
      {!selectedDay && (
        <div className="border-t border-dark p-4 text-center">
          <p className="text-light-dark text-sm">
            Select a day to view workout details
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;