import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { DateWorkout, Exercise, RecurringType } from '../types';
import { Plus, X, Dumbbell, Clock, Edit, Save, Repeat, ArrowRight } from 'lucide-react';
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
  
  const [setsInput, setSetsInput] = useState<string>("3");
  const [repsInput, setRepsInput] = useState<string>("10");
  const [durationInput, setDurationInput] = useState<string>("30");
  
  const [customExercises, setCustomExercises] = useState<string[]>(initialCustomExercises);
  const [newExerciseName, setNewExerciseName] = useState<string>('');
  const [newExerciseType, setNewExerciseType] = useState<'strength' | 'cardio'>('strength');
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState<boolean>(false);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [exerciseTypeMap, setExerciseTypeMap] = useState<Record<string, 'strength' | 'cardio'>>({});

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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

  const handleAddExercise = () => {
    const dateString = formatGMTDateToISO(selectedDate);
    
    let exercise: Exercise;
    const isCustomExercise = customExercises.includes(exerciseType);
    
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
    
    setWorkouts(prev => ({
      ...prev,
      [dateString]: [...(prev[dateString] || []), exercise]
    }));
    
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
      const newWorkouts = { ...workouts };
      delete newWorkouts[date];
      setWorkouts(newWorkouts);
      
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

  const isWeightExercise = (type: string) => {
    if (['Bench Press', 'Squats', 'Deadlift'].includes(type)) {
      return true;
    }
    return customExercises.includes(type) && isExerciseStrength(type);
  };

  const isExerciseStrength = (exerciseName: string): boolean => {
    return exerciseTypeMap[exerciseName] === 'strength';
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
  
  const handleRecurringChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecurring(e.target.value as RecurringType);
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
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const workoutsArray: DateWorkout[] = Object.keys(workouts).map(date => ({
    date,
    exercises: workouts[date],
    recurring: recurringSettings[date] || 'none'
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
                      <optgroup label="Custom Exercises">
                        {customExercises.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5 flex items-center">
                    <Repeat size={18} className="mr-2 text-primary" />
                    Make Recurring
                  </label>
                  <div className="relative">
                    <select
                      className="input-field text-sm w-full appearance-none cursor-pointer"
                      value={recurring}
                      onChange={handleRecurringChange}
                    >
                      <option value="none">None (Single workout)</option>
                      <option value="weekly">Weekly (Next week only)</option>
                      <option value="biweekly">Biweekly (Next 2 occurrences)</option>
                      <option value="month">Month (Next 4 weeks)</option>
                    </select>
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
                Add Exercise
              </button>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-light">Your Workout Plan</h3>
              
              <div className="space-y-4">
                {Object.keys(workouts).length === 0 ? (
                  <p className="text-light-dark text-center py-4 bg-dark rounded-xl">
                    No workouts added yet. Select a date and add exercises to your plan.
                  </p>
                ) : (
                  Object.keys(workouts)
                    .sort()
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