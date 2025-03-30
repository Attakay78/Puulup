import { useState, useMemo } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO, addDays, addWeeks, compareAsc } from 'date-fns';
import { DateWorkout, WorkoutStatus } from '../types';
import { formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';
import { Check } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workouts: DateWorkout[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, workouts }) => {
  // Sort workouts by date for consistent order
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  }, [workouts]);
  
  // Get workout details for a date
  const getWorkoutDetails = (date: Date) => {
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
    
    return null;
  };

  // Get workout completion status (copied from WeeklyCalendar)
  const getWorkoutCompletionStatus = (workout: DateWorkout | null) => {
    if (!workout || workout.exercises.length === 0) return null;
    
    const completedExercises = workout.exercises.filter(e => e.status === WorkoutStatus.DONE).length;
    
    if (completedExercises === 0) return 'not-started';
    if (completedExercises === workout.exercises.length) return 'completed';
    return 'in-progress';
  };

  // Calculate completion percentage (copied from WeeklyCalendar)
  const getCompletionPercentage = (workout: DateWorkout | null) => {
    if (!workout || workout.exercises.length === 0) return 0;
    
    const completedExercises = workout.exercises.filter(e => e.status === WorkoutStatus.DONE).length;
    return Math.round((completedExercises / workout.exercises.length) * 100);
  };

  // Custom tile content with status colors
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const workout = getWorkoutDetails(date);
    if (!workout) return null;

    const completionStatus = getWorkoutCompletionStatus(workout);
    const exerciseCount = workout.exercises.length;

    return (
      <div className="flex justify-center mt-1">
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
      </div>
    );
  };

  return (
    <div className="bg-dark-light rounded-2xl shadow-lg overflow-hidden">
      <style>
        {`
          .react-calendar {
            width: 100%;
            max-width: 100%;
            background: transparent;
            border: none;
            font-family: inherit;
            line-height: 1.125em;
          }

          .react-calendar--doubleView {
            width: 700px;
          }

          .react-calendar--doubleView .react-calendar__viewContainer {
            display: flex;
            margin: -0.5em;
          }

          .react-calendar--doubleView .react-calendar__viewContainer > * {
            width: 50%;
            margin: 0.5em;
          }

          .react-calendar button {
            margin: 0;
            border: 0;
            outline: none;
            color: #FAFAFA;
            font-size: 0.875rem;
          }

          .react-calendar button:enabled:hover {
            cursor: pointer;
          }

          .react-calendar__navigation {
            display: flex;
            height: 50px;
            background: linear-gradient(45deg, #E1306C, #F56040);
            padding: 0.5rem;
            margin-bottom: 0;
          }

          .react-calendar__navigation button {
            min-width: 40px;
            background: none;
            font-size: 0.875rem;
            font-weight: 600;
            padding: 0.25rem;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
          }

          .react-calendar__navigation button:disabled {
            background-color: transparent;
            opacity: 0.5;
          }

          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: rgba(255, 255, 255, 0.15);
          }

          .react-calendar__month-view__weekdays {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 0.75rem;
            background-color: #262626;
            padding: 0.375rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .react-calendar__month-view__weekdays__weekday {
            padding: 0.375rem;
            color: #8E8E8E;
          }

          .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
            cursor: default;
          }

          .react-calendar__month-view__days__day--weekend {
            color: #E1306C;
          }

          .react-calendar__month-view__days__day--neighboringMonth {
            color: #8E8E8E;
            pointer-events: none;
            opacity: 0.5;
          }

          .react-calendar__tile {
            max-width: 100%;
            padding: 0.5rem 0.25rem;
            background: none;
            text-align: center;
            line-height: 14px;
            font-size: 0.75rem;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
          }

          @media (min-width: 640px) {
            .react-calendar__tile {
              padding: 0.75rem 0.5rem;
              font-size: 0.875rem;
              line-height: 16px;
            }
          }

          .react-calendar__tile:disabled {
            background-color: transparent;
            color: #8E8E8E;
          }

          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: #262626;
          }

          .react-calendar__tile--now {
            background: #833AB4 !important;
            color: white !important;
            font-weight: bold;
          }

          .react-calendar__tile--now:enabled:hover,
          .react-calendar__tile--now:enabled:focus {
            background: #5851DB !important;
          }

          .react-calendar__tile--hasActive {
            background: #E1306C;
            color: white;
          }

          .react-calendar__tile--hasActive:enabled:hover,
          .react-calendar__tile--hasActive:enabled:focus {
            background: #C13584;
          }

          .react-calendar__tile--active {
            background: #E1306C !important;
            color: white;
            font-weight: bold;
          }

          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background: #C13584 !important;
          }

          .react-calendar__month-view__days {
            padding: 0.5rem;
          }

          @media (min-width: 640px) {
            .react-calendar__month-view__days {
              padding: 0.75rem;
            }
          }

          .react-calendar__month-view__days .react-calendar__tile {
            padding: 0.625rem 0.25rem;
          }

          @media (min-width: 640px) {
            .react-calendar__month-view__days .react-calendar__tile {
              padding: 0.875rem 0.5rem;
            }
          }
        `}
      </style>
      <ReactCalendar
        onChange={(value: any) => {
          if (value instanceof Date) {
            onDateSelect(value);
          }
        }}
        value={selectedDate}
        tileContent={tileContent}
        minDetail="month"
        locale="en-US"
        formatShortWeekday={(locale, date) => format(date, 'EEE')}
        showNeighboringMonth={false}
      />
      <div className="p-3 sm:p-4 border-t border-dark bg-dark bg-opacity-50">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <span className="text-xs text-light-dark">Not started</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-light-dark">In progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={10} className="text-dark" />
            </div>
            <span className="text-xs text-light-dark">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;