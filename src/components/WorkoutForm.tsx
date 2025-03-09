import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { DateWorkout, Exercise, RecurringType } from '../types';
import { Plus, X, Dumbbell, Clock, Edit, Save, Repeat } from 'lucide-react';
import Calendar from './Calendar';
import { formatGMTDate, formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';

const DEFAULT_EXERCISE_TYPES = ['Bench Press', 'Squats', 'Deadlift', 'Treadmill', 'Cycling'] as const;

interface WorkoutFormProps {
  initialWorkouts?: DateWorkout[];
  initialCustomExercises?: string[];
  onSave: (workouts: DateWorkout[], customExercises: string[]) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  initialWorkouts = [], 
  initialCustomExercises = [],
  onSave 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentGMTDate());
  const [workouts, setWorkouts] = useState<Record<string, Exercise[]>>(
    initialWorkouts.reduce((acc, workout) => {
      acc[workout.date] = workout.exercises;
      return acc;
    }, {} as Record<string, Exercise[]>)
  );
  const [recurringSettings, setRecurringSettings] = useState<Record<string, RecurringType>>(
    initialWorkouts.reduce((acc, workout) => {
      if (workout.recurring) {
        acc[workout.date] = workout.recurring;
      }
      return acc;
    }, {} as Record<string, RecurringType>)
  );

  const [exerciseType, setExerciseType] = useState<string>('Bench Press');
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [duration, setDuration] = useState<number>(30);
  const [recurring, setRecurring] = useState<RecurringType>('none');
  
  // For handling input field values directly
  const [setsInput, setSetsInput] = useState<string>("3");
  const [repsInput, setRepsInput] = useState<string>("10");
  const [durationInput, setDurationInput] = useState<string>("30");
  
  // Custom exercise states
  const [customExercises, setCustomExercises] = useState<string[]>(initialCustomExercises);
  const [newExerciseName, setNewExerciseName] = useState<string>('');
  const [newExerciseType, setNewExerciseType] = useState<'strength' | 'cardio'>('strength');
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState<boolean>(false);
  
  // Step tracking for the form
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Get all exercise types (default + custom)
  const getAllExerciseTypes = () => {
    return [...DEFAULT_EXERCISE_TYPES, ...customExercises];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddExercise = () => {
    const dateString = formatGMTDateToISO(selectedDate);
    
    let exercise: Exercise;
    const isCustomExercise = customExercises.includes(exerciseType);
    
    // Determine if this is a strength or cardio exercise
    const isStrengthExercise = 
      ['Bench Press', 'Squats', 'Deadlift'].includes(exerciseType) || 
      (isCustomExercise && isExerciseStrength(exerciseType));
    
    if (isStrengthExercise) {
      exercise = {
        type: exerciseType,
        sets,
        reps,
        isCustom: isCustomExercise
      };
    } else {
      exercise = {
        type: exerciseType,
        duration,
        isCustom: isCustomExercise
      };
    }
    
    // Add exercise to the selected date
    setWorkouts(prev => ({
      ...prev,
      [dateString]: [...(prev[dateString] || []), exercise]
    }));
    
    // Set recurring setting for this date
    if (recurring !== 'none') {
      setRecurringSettings(prev => ({
        ...prev,
        [dateString]: recurring
      }));
    }
  };

  const handleRemoveExercise = (date: string, index: number) => {
    const newExercises = [...workouts[date]];
    newExercises.splice(index, 1);
    
    if (newExercises.length === 0) {
      // Remove the date entirely if no exercises left
      const newWorkouts = { ...workouts };
      delete newWorkouts[date];
      setWorkouts(newWorkouts);
      
      // Remove recurring setting if no exercises left
      const newRecurringSettings = { ...recurringSettings };
      delete newRecurringSettings[date];
      setRecurringSettings(newRecurringSettings);
    } else {
      setWorkouts({
        ...workouts,
        [date]: newExercises
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedWorkouts: DateWorkout[] = Object.keys(workouts).map(date => ({
      date,
      exercises: workouts[date],
      recurring: recurringSettings[date] || 'none'
    }));
    
    onSave(formattedWorkouts, customExercises);
  };

  // Check if an exercise is a weight/strength exercise
  const isWeightExercise = (type: string) => {
    if (['Bench Press', 'Squats', 'Deadlift'].includes(type)) {
      return true;
    }
    
    // Check if it's a custom strength exercise
    return customExercises.includes(type) && isExerciseStrength(type);
  };
  
  // Track which custom exercises are strength vs cardio
  const [exerciseTypeMap, setExerciseTypeMap] = useState<Record<string, 'strength' | 'cardio'>>({});
  
  // Helper to check if a custom exercise is strength type
  const isExerciseStrength = (exerciseName: string): boolean => {
    return exerciseTypeMap[exerciseName] === 'strength';
  };

  // Add a new custom exercise
  const handleAddCustomExercise = () => {
    if (!newExerciseName.trim()) return;
    
    // Check if exercise name already exists
    if ([...DEFAULT_EXERCISE_TYPES, ...customExercises].includes(newExerciseName as any)) {
      alert('An exercise with this name already exists');
      return;
    }
    
    const updatedCustomExercises = [...customExercises, newExerciseName];
    setCustomExercises(updatedCustomExercises);
    
    // Update the exercise type map
    setExerciseTypeMap({
      ...exerciseTypeMap,
      [newExerciseName]: newExerciseType
    });
    
    // Reset form
    setNewExerciseName('');
    setShowCustomExerciseForm(false);
    
    // Set the newly created exercise as the selected one
    setExerciseType(newExerciseName);
  };
  
  // Remove a custom exercise
  const handleRemoveCustomExercise = (exerciseName: string) => {
    // Remove from custom exercises list
    const updatedCustomExercises = customExercises.filter(name => name !== exerciseName);
    setCustomExercises(updatedCustomExercises);
    
    // Remove from type map
    const updatedTypeMap = { ...exerciseTypeMap };
    delete updatedTypeMap[exerciseName];
    setExerciseTypeMap(updatedTypeMap);
    
    // If the current selected exercise is the one being removed, reset to default
    if (exerciseType === exerciseName) {
      setExerciseType('Bench Press');
    }
    
    // Remove this exercise from all workout days
    const updatedWorkouts = { ...workouts };
    Object.keys(updatedWorkouts).forEach(date => {
      updatedWorkouts[date] = updatedWorkouts[date].filter(ex => ex.type !== exerciseName);
      
      // If no exercises left for this date, remove the date
      if (updatedWorkouts[date].length === 0) {
        delete updatedWorkouts[date];
        
        // Also remove recurring setting
        const newRecurringSettings = { ...recurringSettings };
        delete newRecurringSettings[date];
        setRecurringSettings(newRecurringSettings);
      }
    });
    setWorkouts(updatedWorkouts);
  };

  // Handle sets input change
  const handleSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSetsInput(value);
    
    if (value === '') {
      // Allow empty field in the input
      setSetsInput('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setSets(numValue);
      }
    }
  };
  
  // Handle reps input change
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepsInput(value);
    
    if (value === '') {
      // Allow empty field in the input
      setRepsInput('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setReps(numValue);
      }
    }
  };
  
  // Handle duration input change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDurationInput(value);
    
    if (value === '') {
      // Allow empty field in the input
      setDurationInput('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setDuration(numValue);
      }
    }
  };
  
  // Handle recurring option change
  const handleRecurringChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecurring(e.target.value as RecurringType);
  };
  
  // Handle blur events to ensure valid values when focus leaves the input
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

  // Initialize exercise type map from initial workouts
  useEffect(() => {
    const typeMap: Record<string, 'strength' | 'cardio'> = {};
    
    initialWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.isCustom && exercise.type) {
          typeMap[exercise.type] = exercise.sets !== undefined ? 'strength' : 'cardio';
        }
      });
    });
    
    setExerciseTypeMap(typeMap);
  }, [initialWorkouts]);

  const goToNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Convert workouts object to array for Calendar component
  const workoutsArray: DateWorkout[] = Object.keys(workouts).map(date => ({
    date,
    exercises: workouts[date],
    recurring: recurringSettings[date] || 'none'
  }));

  // Get recurring description based on type
  const getRecurringDescription = (type: RecurringType): string => {
    switch (type) {
      case 'weekly':
        return 'This workout will repeat next week (1 additional occurrence)';
      case 'biweekly':
        return 'This workout will repeat every other week (2 additional occurrences)';
      case 'month':
        return 'This workout will repeat weekly for the next 4 weeks';
      default:
        return '';
    }
  };

  return (
    <div className="bg-dark-light rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 bg-primary text-light">
        <h2 className="text-xl sm:text-2xl font-bold">Create Your Workout Plan</h2>
        <p className="text-light mt-2 text-sm sm:text-base">
          Select dates and add exercises to create a personalized fitness routine.
        </p>
      </div>
      
      {/* Stepper */}
      <div className="flex justify-center p-4 border-b border-dark">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep === 1 ? 'bg-primary text-light' : 'bg-dark text-light-dark'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${
            currentStep === 2 ? 'bg-primary' : 'bg-dark'
          }`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep === 2 ? 'bg-primary text-light' : 'bg-dark text-light-dark'
          }`}>
            2
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {/* Step 1: Select Date */}
        {currentStep === 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-light">Select Workout Dates</h3>
            
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
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={goToNextStep}
              >
                Next: Add Exercises
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Add Exercises */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-light">Add Exercises</h3>
            
            {/* Selected Date Display */}
            <div className="bg-dark rounded-xl p-3 sm:p-4 mb-6">
              <div className="flex justify-between items-center">
                <h4 className="text-primary font-medium">Selected Date</h4>
                <button
                  type="button"
                  className="text-light-dark hover:text-primary transition-colors"
                  onClick={() => setCurrentStep(1)}
                >
                  Change
                </button>
              </div>
              <p className="text-light text-lg font-medium mt-2">
                {formatGMTDate(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            {/* Custom Exercise Management - Enhanced for mobile */}
            <div className="bg-dark rounded-xl p-3 sm:p-4 mb-6">
              <div className="flex justify-between items-center mb-3 border-b border-dark-light pb-2">
                <h4 className="text-secondary font-medium">Custom Exercises</h4>
                <button
                  type="button"
                  className="text-primary hover:text-primary-light transition-colors flex items-center text-sm"
                  onClick={() => setShowCustomExerciseForm(!showCustomExerciseForm)}
                >
                  {showCustomExerciseForm ? (
                    <>
                      <X size={16} className="mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-1" />
                      Add Custom
                    </>
                  )}
                </button>
              </div>
              
              {showCustomExerciseForm && (
                <div className="bg-dark-light p-3 sm:p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-light mb-1">
                        Exercise Name
                      </label>
                      <input
                        type="text"
                        className="input-field text-sm"
                        value={newExerciseName}
                        onChange={(e) => setNewExerciseName(e.target.value)}
                        placeholder="e.g., Pull-ups, Yoga"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-light mb-1">
                        Exercise Type
                      </label>
                      <select
                        className="input-field text-sm"
                        value={newExerciseType}
                        onChange={(e) => setNewExerciseType(e.target.value as 'strength' | 'cardio')}
                      >
                        <option value="strength">Strength (Sets & Reps)</option>
                        <option value="cardio">Cardio (Duration)</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="btn-secondary flex items-center justify-center w-full text-sm"
                    onClick={handleAddCustomExercise}
                    disabled={!newExerciseName.trim()}
                  >
                    <Save size={16} className="mr-2" />
                    Save Custom Exercise
                  </button>
                </div>
              )}
              
              {/* List of custom exercises */}
              <div className="space-y-2">
                {customExercises.length === 0 ? (
                  <p className="text-light-dark text-center py-2 text-sm">No custom exercises added yet.</p>
                ) : (
                  customExercises.map((exercise, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center bg-dark-light p-2 sm:p-3 rounded-lg border border-dark hover:border-primary transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="mr-2 sm:mr-3 bg-primary bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center">
                          {exerciseTypeMap[exercise] === 'strength' ? (
                            <Dumbbell size={16} className="text-primary" />
                          ) : (
                            <Clock size={16} className="text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-light text-sm">{exercise}</p>
                          <p className="text-xs text-light-dark">
                            {exerciseTypeMap[exercise] === 'strength' ? 'Strength' : 'Cardio'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="text-light-dark hover:text-secondary"
                        onClick={() => handleRemoveCustomExercise(exercise)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Enhanced Exercise Details section for mobile */}
            <div className="bg-dark rounded-xl p-3 sm:p-4 mb-6">
              <h4 className="text-primary font-medium mb-3 border-b border-dark-light pb-2">Exercise Details</h4>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-1">
                    Exercise Type
                  </label>
                  <select
                    className="input-field text-sm"
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                  >
                    <optgroup label="Default Exercises">
                      {DEFAULT_EXERCISE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </optgroup>
                    
                    {customExercises.length > 0 && (
                      <optgroup label="Custom Exercises">
                        {customExercises.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                
                {/* Recurring Option */}
                <div>
                  <label className="block text-sm font-medium text-light mb-1 flex items-center">
                    <Repeat size={16} className="mr-1 text-secondary" />
                    Make Recurring
                  </label>
                  <select
                    className="input-field text-sm"
                    value={recurring}
                    onChange={handleRecurringChange}
                  >
                    <option value="none">None (Single workout)</option>
                    <option value="weekly">Weekly (Next week only)</option>
                    <option value="biweekly">Biweekly (Next 2 occurrences)</option>
                    <option value="month">Month (Next 4 weeks)</option>
                  </select>
                  {recurring !== 'none' && (
                    <p className="text-xs text-light-dark mt-1">
                      {getRecurringDescription(recurring)}
                    </p>
                  )}
                </div>
                
                {isWeightExercise(exerciseType) ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-dark-light p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Dumbbell size={18} className="text-primary" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-light mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="input-field text-sm"
                          value={setsInput}
                          onChange={handleSetsChange}
                          onBlur={() => handleInputBlur(setsInput, setSets, setSetsInput, 1)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Dumbbell size={18} className="text-primary" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-light mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="input-field text-sm"
                          value={repsInput}
                          onChange={handleRepsChange}
                          onBlur={() => handleInputBlur(repsInput, setReps, setRepsInput, 1)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-dark-light p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Clock size={18} className="text-secondary" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-light mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="input-field text-sm"
                          value={durationInput}
                          onChange={handleDurationChange}
                          onBlur={() => handleInputBlur(durationInput, setDuration, setDurationInput, 1)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="btn-primary flex items-center justify-center w-full text-sm"
                onClick={handleAddExercise}
              >
                <Plus size={16} className="mr-2" />
                Add Exercise
              </button>
            </div>
            
            {/* Display current workout plan */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-light">Your Workout Plan</h3>
              
              <div className="space-y-4">
                {Object.keys(workouts).length === 0 ? (
                  <p className="text-light-dark text-center py-4 bg-dark rounded-xl">
                    No workouts added yet. Select a date and add exercises to your plan.
                  </p>
                ) : (
                  Object.keys(workouts)
                    .sort() // Sort dates chronologically
                    .map(date => (
                      <div key={date} className="bg-dark rounded-xl p-3 sm:p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-dark-light pb-2">
                           <div>
                            <h4 className="font-medium text-base sm:text-lg text-light">
                              {formatGMTDate(parseISO(date), 'EEE, MMM d, yyyy')}
                            </h4>
                            {recurringSettings[date] && recurringSettings[date] !== 'none' && (
                              <span className={`text-xs ${
                                recurringSettings[date] === 'weekly' 
                                  ? 'text-primary' 
                                  : recurringSettings[date] === 'biweekly'
                                  ? 'text-secondary'
                                  : 'text-green-500'
                              }`}>
                                {recurringSettings[date] === 'weekly' 
                                  ? 'Weekly' 
                                  : recurringSettings[date] === 'biweekly'
                                  ? 'Biweekly'
                                  : 'Month'} recurring
                              </span>
                            )}
                          </div>
                          <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-full">
                            {workouts[date]?.length || 0} exercise{(workouts[date]?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {workouts[date]?.length > 0 && (
                          <div className="space-y-2 sm:space-y-3">
                            {workouts[date].map((exercise, index) => (
                              <div key={index} className="flex justify-between items-center bg-dark-light p-2 sm:p-3 rounded-lg border border-dark hover:border-primary transition-all duration-200">
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
                                  onClick={() => handleRemoveExercise(date, index)}
                                > 
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
            
            {/* Fixed the spacing between buttons for mobile screens */}
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