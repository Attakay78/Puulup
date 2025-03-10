import { useState } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO, addDays } from 'date-fns';
import { DateWorkout } from '../types';
import { formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workouts: DateWorkout[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, workouts }) => {
  // Get workout details for a date
  const getWorkoutDetails = (date: Date) => {
    const dateString = formatGMTDateToISO(date);
    
    // First check for direct workout on this date
    const directWorkout = workouts.find(workout => workout.date === dateString);
    if (directWorkout) return directWorkout;
    
    // If no direct workout, check for recurring workouts
    for (const workout of workouts) {
      const workoutDate = parseISO(workout.date);
      
      if (workout.recurring === 'weekly') {
        // Check if this date is 7 days after the workout
        const nextDate = addDays(workoutDate, 7);
        if (format(nextDate, 'yyyy-MM-dd') === dateString) {
          return workout;
        }
      } 
      else if (workout.recurring === 'biweekly') {
        // Check if this date is 7 or 14 days after the workout
        const nextDate1 = addDays(workoutDate, 7);
        const nextDate2 = addDays(workoutDate, 14);
        if (format(nextDate1, 'yyyy-MM-dd') === dateString || 
            format(nextDate2, 'yyyy-MM-dd') === dateString) {
          return workout;
        }
      }
      else if (workout.recurring === 'month') {
        // Check if this date is 7, 14, or 21 days after the workout
        const nextDate1 = addDays(workoutDate, 7);
        const nextDate2 = addDays(workoutDate, 14);
        const nextDate3 = addDays(workoutDate, 21);
        if (format(nextDate1, 'yyyy-MM-dd') === dateString || 
            format(nextDate2, 'yyyy-MM-dd') === dateString ||
            format(nextDate3, 'yyyy-MM-dd') === dateString) {
          return workout;
        }
      }
    }
    
    return null;
  };

  // Custom tile content
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const workout = getWorkoutDetails(date);
    if (!workout) return null;

    return (
      <div className="flex justify-center mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
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
        onChange={onDateSelect}
        value={selectedDate}
        tileContent={tileContent}
        minDetail="month"
        locale="en-US"
        formatShortWeekday={(locale, date) => format(date, 'EEE')}
        showNeighboringMonth={false}
      />
      <div className="p-3 sm:p-4 border-t border-dark bg-dark bg-opacity-50">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <span className="text-xs text-light-dark">Workout scheduled</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;