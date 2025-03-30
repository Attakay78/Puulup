import { useState, useEffect } from 'react';
import { format, parseISO, addWeeks } from 'date-fns';
import { DateWorkout, Exercise, RecurringType, WorkoutStatus } from '../types';
import { Plus, X, Dumbbell, Clock, Edit, Save, Repeat, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';
import { useCustomExercises } from '../context/CustomExercisesContext';

const DEFAULT_EXERCISE_TYPES = ['Bench Press', 'Squats', 'Deadlift', 'Treadmill', 'Cycling'] as const;

interface WorkoutFormProps {
  initialWorkouts?: DateWorkout[];
  onSave: (workouts: DateWorkout[], customExercises: string[], recurringData: { recurringWorkoutDates: Record<string, Record<number, string[]>>, workouts: Record<string, DateWorkout> }, newlyAddedExercises: Record<string, number[]>) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  initialWorkouts = [], 
  onSave 
}) => {
  // Get custom exercises from context
  const { customExercises, exerciseTypeMap: contextExerciseTypeMap } = useCustomExercises();
  
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentGMTDate());
  const [workouts, setWorkouts] = useState<Record<string, Exercise[]>>({});

  // All state vars related to the current exercise being added
  const [exerciseType, setExerciseType] = useState<string>('Bench Press');
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [duration, setDuration] = useState<number>(30);
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [recurringWeeks, setRecurringWeeks] = useState<number>(0);
  const [recurringWeeksInput, setRecurringWeeksInput] = useState<string>("0");
  
  const [setsInput, setSetsInput] = useState<string>("3");
  const [repsInput, setRepsInput] = useState<string>("10");
  const [durationInput, setDurationInput] = useState<string>("30");
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [exerciseTypeMap, setExerciseTypeMap] = useState<Record<string, 'strength' | 'cardio'>>({});
  const [newlyAddedExercises, setNewlyAddedExercises] = useState<Record<string, number[]>>({});
  const [datesWithNewExercises, setDatesWithNewExercises] = useState<string[]>([]);

  // Initialize workouts state from initialWorkouts prop
  useEffect(() => {
    if (initialWorkouts.length > 0) {
      const workoutsMap = initialWorkouts.reduce((acc, workout) => {
        acc[workout.date] = workout.exercises;
        return acc;
      }, {} as Record<string, Exercise[]>);
      
      setWorkouts(workoutsMap);
    }
  }, [initialWorkouts]);

  // Initialize the exerciseTypeMap based on default and custom exercises
  useEffect(() => {
    const typeMap: Record<string, 'strength' | 'cardio'> = {};
    
    // Map default exercise types
    DEFAULT_EXERCISE_TYPES.forEach(type => {
      if (type === 'Treadmill' || type === 'Cycling') {
        typeMap[type] = 'cardio';
      } else {
        typeMap[type] = 'strength';
      }
    });
    
    // Process initialWorkouts to identify custom exercise types
    initialWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.isCustom) {
          // Determine type based on properties
          if (exercise.duration && !exercise.sets) {
            typeMap[exercise.type] = 'cardio';
          } else {
            typeMap[exercise.type] = 'strength';
          }
        }
      });
    });
    
    // Add custom exercises from context
    for (const exerciseName in contextExerciseTypeMap) {
      typeMap[exerciseName] = contextExerciseTypeMap[exerciseName] as 'strength' | 'cardio';
    }
    
    setExerciseTypeMap(typeMap);
  }, [initialWorkouts, contextExerciseTypeMap]);

  // Log when step changes to help with debugging
  useEffect(() => {
    // Removed console logs
  }, [currentStep, customExercises, exerciseTypeMap]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Format the date to match the format used in workouts
    const dateString = formatGMTDateToISO(date);
    
    // Check if there are existing exercises for this date in initialWorkouts
    const existingWorkout = initialWorkouts.find(workout => workout.date === dateString);
    
    if (existingWorkout && existingWorkout.exercises.length > 0) {
      // If we already have workouts initialized with this date, don't reset exercises
      if (!workouts[dateString]) {
        // Add the exercises to the workouts state
        setWorkouts(prev => ({
          ...prev,
          [dateString]: existingWorkout.exercises
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create base workout objects without recurring info
    const baseWorkouts: Record<string, DateWorkout> = {};
    const recurringWorkoutDates: Record<string, Record<number, string[]>> = {};
    
    // Process each workout date
    Object.keys(workouts).forEach(date => {
      // Add the base workout
      baseWorkouts[date] = {
        date,
        exercises: workouts[date]
      };
      
      // Process recurring exercises
      workouts[date].forEach((exercise, index) => {
        if (exercise.recurring && exercise.recurring !== 'none') {
          if (!recurringWorkoutDates[date]) {
            recurringWorkoutDates[date] = {};
          }
          
          const additionalDates: string[] = [];
          const baseDate = parseISO(date);
          
          // If recurring is a number, add that many weeks
          if (typeof exercise.recurring === 'number') {
            for (let i = 1; i <= exercise.recurring; i++) {
              additionalDates.push(formatGMTDateToISO(addWeeks(baseDate, i)));
            }
          }
          
          if (additionalDates.length > 0) {
            recurringWorkoutDates[date][index] = additionalDates;
          }
        }
      });
    });
    
    // Convert to array format and pass all data
    const formattedWorkouts = Object.values(baseWorkouts);
    const recurringData = {
      recurringWorkoutDates,
      workouts: baseWorkouts
    };
    
    // Pass the newlyAddedExercises tracking state to the parent component
    onSave(formattedWorkouts, customExercises, recurringData, newlyAddedExercises);
  };

  const handleAddExercise = () => {
    const dateString = formatGMTDateToISO(selectedDate);
    
    let exercise: Exercise;
    const isCustomExercise = customExercises.includes(exerciseType);
    
    // Removed console logs
    
    const isStrengthExercise = 
      ['Bench Press', 'Squats', 'Deadlift'].includes(exerciseType) || 
      (isCustomExercise && isExerciseStrength(exerciseType));
    
    // Removed console logs
    
    if (isStrengthExercise) {
      exercise = {
        type: exerciseType,
        sets,
        reps,
        status: WorkoutStatus.UNDONE,
        isCustom: isCustomExercise,
        recurring: recurring !== 'none' ? recurring : undefined
      };
    } else {
      exercise = {
        type: exerciseType,
        duration,
        status: WorkoutStatus.UNDONE,
        isCustom: isCustomExercise,
        recurring: recurring !== 'none' ? recurring : undefined
      };
    }
    
    // Update workouts state with the new exercise
    setWorkouts(prev => {
      const existingExercises = prev[dateString] || [];
      return {
        ...prev,
        [dateString]: [...existingExercises, exercise]
      };
    });
    
    // Track newly added exercise indices
    setNewlyAddedExercises(prev => {
      const currentExerciseIndices = prev[dateString] || [];
      const newIndex = (workouts[dateString]?.length || 0); // The index of the newly added exercise
      return {
        ...prev,
        [dateString]: [...currentExerciseIndices, newIndex]
      };
    });
    
    // Update the list of dates with newly added exercises
    setDatesWithNewExercises(prev => {
      if (!prev.includes(dateString)) {
        return [...prev, dateString];
      }
      return prev;
    });
  };

  const handleRemoveExercise = (date: string, index: number) => {
    const newExercises = [...workouts[date]];
    newExercises.splice(index, 1);
    
    // Also update the newly added exercises indices
    setNewlyAddedExercises(prev => {
      const currentIndices = [...(prev[date] || [])];
      const updatedIndices = currentIndices
        .filter(i => i !== index) // Remove the deleted index
        .map(i => i > index ? i - 1 : i); // Shift down indices that were after the deleted one
      
      // If no more newly added exercises for this date, remove the date from tracking
      if (updatedIndices.length === 0) {
        setDatesWithNewExercises(dates => dates.filter(d => d !== date));
      }
      
      return {
        ...prev,
        [date]: updatedIndices
      };
    });
    
    if (newExercises.length === 0) {
      const newWorkouts = { ...workouts };
      delete newWorkouts[date];
      setWorkouts(newWorkouts);
      
      // Also clean up the newly added exercises tracking for this date
      const newlyAdded = { ...newlyAddedExercises };
      delete newlyAdded[date];
      setNewlyAddedExercises(newlyAdded);
      
      // Remove from dates with new exercises
      setDatesWithNewExercises(dates => dates.filter(d => d !== date));
    } else {
      setWorkouts({
        ...workouts,
        [date]: newExercises
      });
    }
  };

  const isWeightExercise = (type: string) => {
    if (['Bench Press', 'Squats', 'Deadlift'].includes(type)) {
      return true;
    }
    return customExercises.includes(type) && isExerciseStrength(type);
  };

  const isExerciseStrength = (type: string): boolean => {
    // First check our local exercise type map
    if (exerciseTypeMap[type]) {
      return exerciseTypeMap[type] === 'strength';
    }
    
    // Then check context exercise type map
    if (contextExerciseTypeMap[type]) {
      return contextExerciseTypeMap[type] === 'strength';
    }
    
    // Default to strength for unknown exercise types
    return true;
  };

  const handleSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSetsInput(value);
    
    if (value === '') {
      setSetsInput('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setSets(numValue);
      }
    }
  };
  
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepsInput(value);
    
    if (value === '') {
      setRepsInput('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setReps(numValue);
      }
    }
  };
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDurationInput(value);
    
    if (value === '') {
      setDurationInput('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setDuration(numValue);
      }
    }
  };
  
  const handleRecurringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecurringWeeksInput(value);
    
    if (value === '' || value === '0') {
      setRecurring('none');
      setRecurringWeeks(0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setRecurring(numValue);
        setRecurringWeeks(numValue);
      }
    }
  };
  
  const handleInputBlur = (
    inputValue: string, 
    setter: React.Dispatch<React.SetStateAction<number>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
    defaultValue: number
  ) => {
    if (inputValue === '' || isNaN(parseInt(inputValue, 10)) || parseInt(inputValue, 10) <= 0) {
      setter(defaultValue);
      inputSetter(defaultValue.toString());
    }
  };

  const goToNextStep = () => {
    if (currentStep < 2) {
      // When going to step 2, prepare the exercises for the selected date if any exist
      const dateString = formatGMTDateToISO(selectedDate);
      
      // Check if there are exercises for this date but not in our current workouts state
      const existingWorkout = initialWorkouts.find(workout => workout.date === dateString);
      if (existingWorkout && existingWorkout.exercises.length > 0 && !workouts[dateString]) {
        // Add the exercises to the workouts state
        setWorkouts(prev => ({
          ...prev,
          [dateString]: existingWorkout.exercises
        }));
      }
      
      // Removed console log
      
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getRecurringDescription = (type: RecurringType): string => {
    if (type === 'none') {
      return '';
    }
    
    if (typeof type === 'number') {
      if (type === 1) {
        return 'This workout will repeat next week (1 additional occurrence)';
      } else {
        return `This workout will repeat for the next ${type} weeks`;
      }
    }
    
    return '';
  };

  const workoutsArray: DateWorkout[] = Object.keys(workouts).map(date => ({
    date,
    exercises: workouts[date]
  }));

  return (
    <div className="bg-dark-light rounded-2xl shadow-md overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-light">Select Workout Dates</h3>
            
            {/* Mobile Next Button - Only visible on mobile */}
            <div className="sm:hidden mb-4">
              <button
                type="button"
                className="btn-primary w-full flex items-center justify-center"
                onClick={goToNextStep}
              >
                <span>Next: Add Exercises</span>
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
            
            <div className="max-w-md mx-auto">
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                workouts={workoutsArray}
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-light-dark text-sm mb-2">
                Selected date: <span className="text-light font-medium">{formatGMTDate(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </p>
              <p className="text-light-dark text-xs">
                {workouts[formatGMTDateToISO(selectedDate)] 
                  ? `${workouts[formatGMTDateToISO(selectedDate)].length} exercise(s) planned` 
                  : 'No workouts planned for this date'}
              </p>
            </div>
            
            {/* Desktop Next Button - Hidden on mobile */}
            <div className="hidden sm:flex mt-8 justify-end">
              <button
                type="button"
                className="btn-primary w-full sm:w-auto flex items-center justify-center"
                onClick={goToNextStep}
              >
                <span>Next: Add Exercises</span>
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div>
            <div className="bg-dark rounded-xl p-3 sm:p-4 mb-6">
              <div className="flex justify-between items-center">
                <h4 className="text-primary font-medium">Selected Date</h4>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="text-light-dark hover:text-primary transition-colors"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change
                  </button>
                </div>
              </div>
              <p className="text-light text-lg font-medium mt-2">
                {formatGMTDate(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="bg-dark rounded-xl p-3 sm:p-4 mb-6">
              <div className="flex justify-between items-center mb-3 border-b border-dark-light pb-2">
                <h4 className="text-primary font-medium">Exercise Details</h4>
              </div>
              
              <div className="space-y-4 bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5">
                    Exercise Type
                  </label>
                  <select
                    className="input-field text-sm w-full"
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                  >
                    <optgroup label="Default Exercises">
                      {DEFAULT_EXERCISE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </optgroup>
                    
                    {customExercises.length > 0 && (
                      <optgroup label={`Custom Exercises (${customExercises.length})`}>
                        {customExercises.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {customExercises.length === 0 && (
                    <p className="text-xs text-light-dark mt-1">
                      You can create custom exercises in your <a href="/profile" className="text-primary hover:underline">profile</a>.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5 flex items-center">
                    <Repeat size={18} className="mr-2 text-primary" />
                    Repeat for weeks
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="input-field text-sm w-full"
                      value={recurringWeeksInput}
                      onChange={handleRecurringChange}
                      onBlur={() => handleInputBlur(recurringWeeksInput, setRecurringWeeks, setRecurringWeeksInput, 0)}
                      min="0"
                      max="12"
                      placeholder="0 (no repetition)"
                    />
                  </div>
                  {recurring !== 'none' && (
                    <p className="text-xs text-light-dark mt-1.5">
                      {getRecurringDescription(recurring)}
                    </p>
                  )}
                </div>
                
                {isWeightExercise(exerciseType) ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light mb-1.5">
                        Sets
                      </label>
                      <input
                        type="number"
                        className="input-field text-sm"
                        value={setsInput}
                        onChange={handleSetsChange}
                        onBlur={() => handleInputBlur(setsInput, setSets, setSetsInput, 1)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-light mb-1.5">
                        Reps
                      </label>
                      <input
                        type="number"
                        className="input-field text-sm"
                        value={repsInput}
                        onChange={handleRepsChange}
                        onBlur={() => handleInputBlur(repsInput, setReps, setRepsInput, 1)}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-light mb-1.5">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={durationInput}
                      onChange={handleDurationChange}
                      onBlur={() => handleInputBlur(durationInput, setDuration, setDurationInput, 1)}
                    />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="btn-primary flex items-center justify-center w-full text-sm mt-4"
                onClick={handleAddExercise}
              >
                <Plus size={16} className="mr-2" />
                Add Exercise to {formatGMTDate(selectedDate, 'MMM d')}
              </button>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-light">Added Exercises</h3>
              </div>
              
              {/* Show newly added exercises for the selected date */}
              <div className="bg-dark rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex justify-between items-center mb-3 border-b border-dark-light pb-2">
                  <div>
                    <h4 className="font-medium text-base sm:text-lg text-light">
                      {formatGMTDate(selectedDate, 'EEE, MMM d, yyyy')}
                    </h4>
                  </div>
                </div>
                
                {newlyAddedExercises[formatGMTDateToISO(selectedDate)]?.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {workouts[formatGMTDateToISO(selectedDate)]
                      .filter((_, index) => 
                        (newlyAddedExercises[formatGMTDateToISO(selectedDate)] || []).includes(index))
                      .map((exercise, index) => {
                        // Need to get the actual index for removal
                        const actualIndex = (newlyAddedExercises[formatGMTDateToISO(selectedDate)] || [])[index];
                        
                        return (
                          <div key={`${formatGMTDateToISO(selectedDate)}-${actualIndex}`} 
                               className="flex justify-between items-center bg-dark-light p-2 sm:p-3 rounded-lg border 
                                         border-primary hover:border-primary transition-all duration-200">
                            <div className="flex items-center">
                              <div className="mr-2 sm:mr-3 bg-primary bg-opacity-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                                {exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                                  (exercise.isCustom && !exercise.sets) ? (
                                  <Clock size={16} className="text-primary" />
                                ) : (
                                  <Dumbbell size={16} className="text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-light text-sm">
                                  {exercise.type}
                                  {exercise.isCustom && (
                                    <span className="ml-1 sm:ml-2 text-xs bg-secondary bg-opacity-20 text-secondary px-1 sm:px-2 py-0.5 rounded-full">
                                      Custom
                                    </span>
                                  )}
                                  {exercise.recurring && exercise.recurring !== 'none' && (
                                    <span className="ml-1 sm:ml-2 text-xs bg-primary bg-opacity-20 text-primary px-1 sm:px-2 py-0.5 rounded-full">
                                      {typeof exercise.recurring === 'number'
                                        ? `${exercise.recurring} week${exercise.recurring !== 1 ? 's' : ''}`
                                        : ''} recurring
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
                            
                            <button
                              type="button"
                              className="text-light-dark hover:text-secondary"
                              onClick={() => handleRemoveExercise(formatGMTDateToISO(selectedDate), actualIndex)}
                            > 
                              <X size={18} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-light-dark text-center py-3">
                    No exercises added to this date yet.
                  </p>
                )}
              </div>
              
              {/* Show newly added exercises for all other dates */}
              {datesWithNewExercises
                .filter(date => date !== formatGMTDateToISO(selectedDate))
                .map(dateString => (
                  <div key={dateString} className="bg-dark rounded-xl p-3 sm:p-4 mb-4">
                    <div className="flex justify-between items-center mb-3 border-b border-dark-light pb-2">
                      <div>
                        <h4 className="font-medium text-base sm:text-lg text-light">
                          {formatGMTDate(parseISO(dateString), 'EEE, MMM d, yyyy')}
                        </h4>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="text-xs bg-secondary bg-opacity-20 text-secondary px-2 py-1 rounded-full"
                          onClick={() => setSelectedDate(parseISO(dateString))}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {workouts[dateString]
                        .filter((_, index) => 
                          (newlyAddedExercises[dateString] || []).includes(index))
                        .map((exercise, index) => {
                          // Need to get the actual index for removal
                          const actualIndex = (newlyAddedExercises[dateString] || [])[index];
                          
                          return (
                            <div key={`${dateString}-${actualIndex}`} 
                                 className="flex justify-between items-center bg-dark-light p-2 sm:p-3 rounded-lg border 
                                           border-primary hover:border-primary transition-all duration-200">
                              <div className="flex items-center">
                                <div className="mr-2 sm:mr-3 bg-primary bg-opacity-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                                  {exercise.type === 'Treadmill' || exercise.type === 'Cycling' || 
                                    (exercise.isCustom && !exercise.sets) ? (
                                    <Clock size={16} className="text-primary" />
                                  ) : (
                                    <Dumbbell size={16} className="text-primary" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-light text-sm">
                                    {exercise.type}
                                    {exercise.isCustom && (
                                      <span className="ml-1 sm:ml-2 text-xs bg-secondary bg-opacity-20 text-secondary px-1 sm:px-2 py-0.5 rounded-full">
                                        Custom
                                      </span>
                                    )}
                                    {exercise.recurring && exercise.recurring !== 'none' && (
                                      <span className="ml-1 sm:ml-2 text-xs bg-primary bg-opacity-20 text-primary px-1 sm:px-2 py-0.5 rounded-full">
                                        {typeof exercise.recurring === 'number'
                                          ? `${exercise.recurring} week${exercise.recurring !== 1 ? 's' : ''}`
                                          : ''} recurring
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
                              
                              <button
                                type="button"
                                className="text-light-dark hover:text-secondary"
                                onClick={() => handleRemoveExercise(dateString, actualIndex)}
                              > 
                                <X size={18} />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}

              {/* Button to review all workouts */}
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  className="text-primary text-sm hover:text-secondary transition-colors flex items-center"
                  onClick={() => setCurrentStep(1)}
                >
                  <CalendarIcon className="mr-2" size={14} />
                  Review full calendar
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={goToPreviousStep}
              >
                Back: Select Dates
              </button>
              
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto"
              >
                Save Workout Plan
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default WorkoutForm;