import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateWorkout } from '../types';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate, isSameGMTDay } from '../utils/dateUtils';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workouts: DateWorkout[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, workouts }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const goToPreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Check if a date has a workout
  const hasWorkout = (date: Date) => {
    const dateString = formatGMTDateToISO(date);
    return workouts.some(workout => workout.date === dateString);
  };
  
  // Get workout details for a date
  const getWorkoutDetails = (date: Date) => {
    const dateString = formatGMTDateToISO(date);
    return workouts.find(workout => workout.date === dateString);
  };
  
  // Get today's date for highlighting
  const today = getCurrentGMTDate();
  
  return (
    <div className="bg-dark-light rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 bg-primary text-light">
        <div className="flex justify-between items-center">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-primary-dark transition-colors"
            type="button"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button 
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-primary-dark transition-colors"
            type="button"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-medium text-light-dark py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isSelected = isSameGMTDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isSameGMTDay(day, today);
            const workout = getWorkoutDetails(day);
            const hasWorkoutForDay = hasWorkout(day);
            
            return (
              <button
                key={day.toString()}
                onClick={() => onDateSelect(day)}
                className={`
                  h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center
                  ${isCurrentMonth ? 'text-light' : 'text-light-dark opacity-40'}
                  ${isSelected ? 'bg-primary text-light' : 
                    isCurrentDay ? 'bg-secondary text-light' :
                    hasWorkoutForDay ? 'bg-secondary bg-opacity-20' : 'hover:bg-dark'}
                  transition-colors
                `}
                type="button"
                aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                aria-selected={isSelected}
              >
                <span className={`text-sm ${isSelected || isCurrentDay ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasWorkoutForDay && !isSelected && !isCurrentDay && (
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-0.5"></div>
                )}
                {workout?.recurring === 'weekly' && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5"></div>
                )}
                {workout?.recurring === 'biweekly' && (
                  <div className="w-1 h-1 rounded-full bg-secondary mt-0.5"></div>
                )}
                {workout?.recurring === 'month' && (
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-0.5"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;