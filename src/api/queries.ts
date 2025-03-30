import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getWorkoutPlan, 
  getWorkoutsForDateRange, 
  updateWorkoutStatus, 
  updateExerciseStatus,
  getAllExercises,
  saveDateWorkoutPlan,
  getUser,
  updateUser
} from './index';
import { DateWorkoutPlan, WorkoutStatus } from '../types';
import { formatGMTDateToISO } from '../utils/dateUtils';

// Query keys
export const queryKeys = {
  workoutPlan: 'workoutPlan',
  workoutsForDateRange: 'workoutsForDateRange',
  exercises: 'exercises',
  user: 'user',
};

// Get workout plan
export const useWorkoutPlan = (userId: string, planId: string) => {
  return useQuery({
    queryKey: [queryKeys.workoutPlan, userId],
    queryFn: () => getWorkoutPlan(userId, planId),
    enabled: !!userId,
  });
};

// Get workouts for date range
export const useWorkoutsForDateRange = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: [queryKeys.workoutsForDateRange, userId, formatGMTDateToISO(startDate), formatGMTDateToISO(endDate)],
    queryFn: () => getWorkoutsForDateRange(
      userId, 
      formatGMTDateToISO(startDate), 
      formatGMTDateToISO(endDate)
    ),
    enabled: !!userId,
    // Add caching configuration to prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000,   // Keep unused data in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};

// Get all exercises
export const useExercises = () => {
  return useQuery({
    queryKey: [queryKeys.exercises],
    queryFn: getAllExercises,
  });
};

// Get user data
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: [queryKeys.user, userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
};

// Update workout status
export const useUpdateWorkoutStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      date, 
      status 
    }: { 
      userId: string; 
      date: string; 
      status: WorkoutStatus 
    }) => updateWorkoutStatus(userId, date, status),
    
    onSuccess: (_, variables) => {
      // Update all exercises for the specific date in the workout plan cache
      queryClient.setQueriesData(
        { queryKey: [queryKeys.workoutPlan, variables.userId] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Clone the workout plan to avoid direct mutation
          const newData = structuredClone(oldData);
          
          // Find and update all exercises for the matching date
          if (newData.workouts) {
            let dateFound = false;
            
            // Use a more optimized loop with early termination if date is unique
            for (let i = 0; i < newData.workouts.length; i++) {
              const workout = newData.workouts[i];
              if (workout.date === variables.date) {
                dateFound = true;
                
                // Update all exercises in this workout
                const exercises = workout.exercises;
                if (exercises && Array.isArray(exercises)) {
                  for (let j = 0; j < exercises.length; j++) {
                    exercises[j].status = variables.status;
                  }
                }
                
                // If we know dates are unique, we can break early
                // If dates might be duplicated, remove this break
                break;
              }
            }
          }
          
          return newData;
        }
      );
      
      // Do the same for date range queries - find and update the specific exercise
      queryClient.setQueriesData(
        { queryKey: [queryKeys.workoutsForDateRange, variables.userId] },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          
          // Clone the data to avoid direct mutation
          const newData = structuredClone(oldData);
          
          // Update all exercises for the matching date
          for (const workout of newData) {
            // Match the workout by date
            if (workout.date === variables.date) {
              const exercises = workout.exercises;
              if (exercises && Array.isArray(exercises)) {
                // Update all exercises in this workout to the same status
                for (let i = 0; i < exercises.length; i++) {
                  exercises[i].status = variables.status;
                }
              }
            }
          }
          
          return newData;
        }
      );
    },
  });
};

// Update exercise status
export const useUpdateExerciseStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId,
      exerciseId,
      status 
    }: { 
      userId: string; 
      exerciseId: number;
      status: WorkoutStatus 
    }) => updateExerciseStatus(userId, exerciseId, status),
    
    onSuccess: (_, variables) => {
      // Update the specific exercise in the workout plan cache
      queryClient.setQueriesData(
        { queryKey: [queryKeys.workoutPlan, variables.userId] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          // Clone the workout plan to avoid direct mutation
          const newData = structuredClone(oldData);
          
          // Find and update the specific exercise with matching id
          if (newData.workouts) {
            let exerciseFound = false;
            
            // Find the exercise by ID with early termination
            for (const workout of newData.workouts) {
              if (exerciseFound) break;
              
              for (let i = 0; i < workout.exercises.length; i++) {
                const exercise = workout.exercises[i];
                if (exercise.id === variables.exerciseId) {
                  // Update the exercise status
                  exercise.status = variables.status;
                  exerciseFound = true;
                  break;
                }
              }
            }
          }
          
          return newData;
        }
      );
      
      // Do the same for date range queries - find and update the specific exercise
      queryClient.setQueriesData(
        { queryKey: [queryKeys.workoutsForDateRange, variables.userId] },
        (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          
          // Clone the data to avoid direct mutation
          const newData = structuredClone(oldData);
          
          // Update the specific exercise in workouts with early termination
          let exerciseFound = false;
          
          for (const workout of newData) {
            if (exerciseFound) break;
            
            const exercises = workout.exercises;
            if (!exercises || !Array.isArray(exercises)) continue;
            
            for (let i = 0; i < exercises.length; i++) {
              const exercise = exercises[i];
              if (exercise.id === variables.exerciseId) {
                exercise.status = variables.status;
                exerciseFound = true;
                break;
              }
            }
          }
          
          return newData;
        }
      );
    },
  });
};

// Save workout plan
export const useSaveWorkoutPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workoutPlan: DateWorkoutPlan) => saveDateWorkoutPlan(workoutPlan),
    
    onSuccess: (_, variables) => {
      // Invalidate workout plan and workout date range queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.workoutPlan, variables.userId] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.workoutsForDateRange, variables.userId] });
    },
  });
};

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: {
      name?: string;
      contact?: string;
      profileImage?: string;
    }) => updateUser(userData),
    
    onSuccess: (_, variables) => {
      // Invalidate user data query
      queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
    },
  });
}; 