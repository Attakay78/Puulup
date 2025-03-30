import { User, WorkoutPlan, DateWorkoutPlan, DateWorkout, Exercise, ApiWorkout, ApiExercise, WorkoutStatus, ExerciseType, ApiUserWorkout, ApiWorkoutWithExercises, ApiMultiDateWorkout, ApiGroupedWorkout } from '../types';
import { formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';

// Base URL for API requests
// Using relative URL to work with the proxy configuration in vite.config.ts
const API_BASE_URL = '/api';

// Helper function for making authenticated API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const authData = localStorage.getItem('gymtracker_auth');
  let token = '';
  
  if (authData) {
    const auth = JSON.parse(authData);
    token = auth.token;
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  };
  
  try {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
        ...options.headers,
    },
  });
  
    // Handle HTTP errors
  if (!response.ok) {
      // Try to get error details from response
      const errorData = await response.json().catch(() => null);
      
      // If not authenticated, clear local storage
    if (response.status === 401) {
      localStorage.removeItem('gymtracker_auth');
      }
      
      throw new Error(
        errorData?.detail || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
};

// Signup API
export const signup = async (userData: Omit<User, 'id'>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        contact: userData.contact,
        profile_image: userData.profileImage
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'User registration failed');
    }
    
    const data = await response.json();
    return { userId: data.id };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Signin API
export const signin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const data = await response.json();
    
    // Store auth info in localStorage
    localStorage.setItem('gymtracker_auth', JSON.stringify({
      token: data.access_token,
      user: {
        id: data.user_id.toString(),
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        contact: data.contact || '',
        planId: data.plan_id.toString()
      }
    }));
    
    return {
      token: data.access_token,
      user: {
        id: data.user_id.toString(),
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        contact: data.contact || '',
        planId: data.plan_id.toString()
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get user API
export const getUser = async (id: string) => {
  try {
    const userData = await apiRequest('users/me');
    
    return {
      id: userData.id.toString(),
      name: userData.name,
      email: userData.email,
      contact: userData.contact || '',
      profileImage: userData.profile_image
    };
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Update user API
export const updateUser = async (userData: {
  name?: string;
  contact?: string;
  profileImage?: string;
}) => {
  try {
    const response = await apiRequest('users/me', {
      method: 'PUT',
      body: JSON.stringify({
        name: userData.name,
        contact: userData.contact,
        profile_image: userData.profileImage
      }),
    });
    
    // Update the user in localStorage if authentication data exists
    const authData = localStorage.getItem('gymtracker_auth');
    if (authData) {
      const auth = JSON.parse(authData);
      auth.user = { ...auth.user, ...userData };
      localStorage.setItem('gymtracker_auth', JSON.stringify(auth));
    }
    
    return response;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Fetch all exercises
export const getAllExercises = async () => {
  try {
    return await apiRequest('exercises');
  } catch (error) {
    console.error('Get exercises error:', error);
    throw error;
  }
};

// Fetch only custom exercises for the current user
export const getCustomExercises = async () => {
  try {
    return await apiRequest('exercises/custom');
  } catch (error) {
    console.error('Get custom exercises error:', error);
    throw error;
  }
};

// Get workout plans
export const getWorkoutPlans = async () => {
  try {
    // Get all workout plans for the user - one should always exist
    const plans = await apiRequest('workout-plans');
    // Return the first plan (there should always be one)
    if (plans.length > 0) {
      return plans[0];
    }else {
      // Else return empty array
      return [];
    }
    
  } catch (error) {
    console.error('Get workout plan error:', error);
    throw new Error('No workout plans found for user');
  }
};

// Get workout plan API
export const getWorkoutPlan = async (userId: string, planId: string) => {
  try {
    
    // Get all workouts for this plan
    const workouts = await apiRequest(`workouts?plan_id=${planId}`);

    // Get all exercises
    const allExercises = await getAllExercises();
    
    // Get custom exercises
    const customExercises = allExercises
      .filter((ex: ApiExercise) => ex.is_custom)
      .map((ex: ApiExercise) => ex.name);
    
    // OPTIMIZATION: Instead of fetching user_workouts for each workout individually,
    // get all user workouts in a single query with workout_ids
    const workoutIds = workouts.map((w: ApiWorkout) => w.id);
    let userWorkoutsMap: Map<number, ApiUserWorkout[]> = new Map();
    
    if (workoutIds.length > 0) {
      // Get all user workouts for these workouts in bulk
      const allUserWorkouts = await apiRequest(`user-workouts`);
      
      // Group user workouts by workout_id for faster lookup
      userWorkoutsMap = allUserWorkouts.reduce((map: Map<number, ApiUserWorkout[]>, uw: ApiUserWorkout) => {
        if (!map.has(uw.workout_id)) {
          map.set(uw.workout_id, []);
        }
        map.get(uw.workout_id)?.push(uw);
        return map;
      }, new Map());
    }
    
    // Format workouts with exercises
    const formattedWorkouts: DateWorkout[] = workouts.map((workout: ApiWorkout) => {
      const userWorkouts = userWorkoutsMap.get(workout.id) || [];
      
      // Map the exercises with their details
      const exercises = userWorkouts.map((uw: ApiUserWorkout) => {
        // Get exercise details
        const exerciseDetails = allExercises.find((ex: ApiExercise) => ex.id === uw.exercise_id);
        
        if (!exerciseDetails) return null;
        
        return {
          id: uw.id,
          type: exerciseDetails.name,
          sets: uw.sets,
          reps: uw.reps,
          duration: uw.duration,
          status: uw.status,
          isCustom: exerciseDetails.is_custom
        } as Exercise;
      }).filter(Boolean) as Exercise[];
      
      return {
      date: workout.date,
        exercises
      };
    });
    
    // Convert back to array
    const newWorkouts = Array.from(formattedWorkouts.values());
    
    // Sort workouts by date (chronologically)
    newWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      userId,
      workouts: newWorkouts,
      customExercises
    } as DateWorkoutPlan;
  } catch (error) {
    console.error('Get workout plan error:', error);
    
    // Return empty plan if error
    return { 
      userId, 
      workouts: [], 
      customExercises: [] 
    } as DateWorkoutPlan;
  }
};

// Get workouts for a specific date range
export const getWorkoutsForDateRange = async (userId: string, startDate: string, endDate: string) => {
  try {
    // Use the new optimized endpoint that returns workouts already grouped by date
    const groupedWorkouts: ApiGroupedWorkout[] = await apiRequest(`workouts-by-date?start_date=${startDate}&end_date=${endDate}`);
    
    if (!groupedWorkouts || groupedWorkouts.length === 0) {
      return [];
    }
    
    // The data is already in the format we need with exercises grouped by date
    // Just format dates as strings to match the expected DateWorkout type
    const formattedWorkouts = groupedWorkouts.map((workout: ApiGroupedWorkout) => ({
      date: workout.date, // This is already a string in ISO format
      exercises: workout.exercises.map((exercise) => ({
        id: exercise.id,
        type: exercise.type,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        status: exercise.status,
        isCustom: exercise.isCustom
      }))
    }));
    
    return formattedWorkouts;
  } catch (error) {
    console.error('Get workouts for date range error:', error);
    return [];
  }
};

// Save workout plan API
export const saveDateWorkoutPlan = async (workoutPlan: DateWorkoutPlan) => {
  try {
    // Ensure we have a plan ID
    const planId = workoutPlan.planId;
    
    // Skip processing if there are no workouts to save
    if (!workoutPlan.workouts || workoutPlan.workouts.length === 0) {
      return { success: true };
    }
    
    // Send the workout plan directly to the multi-date endpoint
    // The backend can now handle this format directly and allows duplicate exercises
    await apiRequest('workouts/multi-date', {
      method: 'POST',
      body: JSON.stringify({
        userId: workoutPlan.userId,
        planId: planId,
        workouts: workoutPlan.workouts,
        customExercises: workoutPlan.customExercises || []
      }),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Save workout plan error:', error);
    throw error;
  }
};

// Helper to map frontend exercises to API format
async function mapExercisesToApi(exercises: Exercise[], allExercises: ApiExercise[]) {
  const mappedExercises = [];
  const exerciseIdsToCreate: Exercise[] = [];
  
  // Create a map of exercise names to IDs for faster lookups
  const exerciseNameToIdMap = new Map<string, number>();
  allExercises.forEach(ex => {
    exerciseNameToIdMap.set(ex.name.toLowerCase(), ex.id);
  });
  
  // First, identify exercises that need to be created
  for (const exercise of exercises) {
    const exerciseLowerCase = exercise.type.toLowerCase();
    if (!exerciseNameToIdMap.has(exerciseLowerCase) && exercise.isCustom) {
      // Check if we've already added this to the creation list (to avoid duplicates)
      if (!exerciseIdsToCreate.some(e => e.type.toLowerCase() === exerciseLowerCase)) {
        exerciseIdsToCreate.push(exercise);
      }
    }
  }
  
  // Batch create custom exercises if needed
  let newExercises: ApiExercise[] = [];
  if (exerciseIdsToCreate.length > 0) {
    // Since we don't have a proper batch endpoint, we'll create exercises in parallel
    const createPromises = exerciseIdsToCreate.map(exercise => 
      apiRequest('exercises', {
        method: 'POST',
        body: JSON.stringify({
          name: exercise.type,
          exercise_type: exercise.duration ? ExerciseType.CARDIO : ExerciseType.STRENGTH,
          is_custom: true
        }),
      })
    );
    
    // Wait for all exercise creation requests to complete
    newExercises = await Promise.all(createPromises);
    
    // Add new exercises to lookup maps for quick access
    newExercises.forEach(ex => {
      exerciseNameToIdMap.set(ex.name.toLowerCase(), ex.id);
      allExercises.push(ex);
    });
  }
  
  // Now map all exercises to API format
  for (const exercise of exercises) {
    const exerciseLowerCase = exercise.type.toLowerCase();
    
    // Get exercise ID from our map (much faster than repeated find operations)
    const exerciseId = exerciseNameToIdMap.get(exerciseLowerCase);
    
    if (!exerciseId) {
      // Skip this exercise if we couldn't find or create it
      console.error(`Exercise ${exercise.type} not found and couldn't be created`);
      continue;
    }
    
    mappedExercises.push({
      exercise_id: exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      duration: exercise.duration,
      status: exercise.status || WorkoutStatus.UNDONE
    });
  }
  
  return mappedExercises;
}

// Add workout API
export const addWorkout = async (
  userId: string, 
  date: string, 
  exercises: DateWorkout['exercises']
) => {
  try {
    // Get or create first workout plan
    const plan = await getWorkoutPlans();
    const planId = plan.id;
    
    // Get all exercises
    const allExercises = await getAllExercises();
    
    // Create workout with exercises
    const workout = await apiRequest('workouts/simple', {
        method: 'POST',
        body: JSON.stringify({
        date: date,
          plan_id: planId,
        exercises: await mapExercisesToApi(exercises, allExercises)
        }),
      });
      
    return {
      date,
      exercises
    } as DateWorkout;
  } catch (error) {
    console.error('Add workout error:', error);
    throw error;
  }
};

// Add recurring workouts API
export const addRecurringWorkouts = async (
  userId: string,
  dates: string[],
  exercises: DateWorkout['exercises']
) => {
  try {
    // Get or create first workout plan
    const plan = await getWorkoutPlans();
    const planId = plan.id;
    
    // Get all exercises
    const allExercises = await getAllExercises();
    
    // Create workouts for multiple dates
    const apiExercises = await mapExercisesToApi(exercises, allExercises);
    
    const workouts = await apiRequest('workouts/multi-date', {
      method: 'POST',
      body: JSON.stringify({
        dates: dates,
        plan_id: planId,
        exercises: apiExercises
      }),
    });
    
    // Format response
    return dates.map(date => ({
      date,
      exercises
    })) as DateWorkout[];
  } catch (error) {
    console.error('Add recurring workouts error:', error);
    throw error;
  }
};

// Delete workout API
export const deleteWorkout = async (userId: string, date: string) => {
  try {
    // Get first plan
    const plan = await getWorkoutPlans();
    if (!plan) {
      throw new Error('No workout plans found');
    }
    
    const planId = plan.id;
    
    // Find the workout by date and plan_id
    const workouts = await apiRequest(`workouts?plan_id=${planId}`);
    const workoutToDelete = workouts.find((w: ApiWorkout) => w.date === date);
    
    if (!workoutToDelete) {
      throw new Error('Workout not found');
    }
    
      // Delete the workout
    await apiRequest(`workouts/${workoutToDelete.id}`, {
        method: 'DELETE',
      });
    
    return { success: true };
  } catch (error) {
    console.error('Delete workout error:', error);
    throw error;
  }
};

// Update workout status
export const updateWorkoutStatus = async (userId: string, date: string, status: WorkoutStatus) => {
  try {
    // Use a simplified, more efficient endpoint that handles this in a single request
    // The backend will find all workouts for this date that belong to the current user
    const result = await apiRequest('workouts/update-date-status', {
      method: 'POST',
      body: JSON.stringify({
        date,
        status
      }),
    });
    
    return result;
  } catch (error) {
    console.error('Update all workouts for date error:', error);
    throw error;
  }
};

// Update a single exercise status
export const updateExerciseStatus = async (
  userId: string,
  exerciseId: number,
  status: WorkoutStatus
) => {
  try {
    // Update the specific user_workout at the given index
    await apiRequest(`user-workouts/${exerciseId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status
      }),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Update exercise status error:', error);
    throw error;
  }
};

// Authentication helpers
export const isAuthenticated = () => {
  const authData = localStorage.getItem('gymtracker_auth');
  return !!authData;
};

export const getCurrentUser = () => {
  const authData = localStorage.getItem('gymtracker_auth');
  if (!authData) return null;
  
  return JSON.parse(authData).user;
};

export const logout = () => {
  localStorage.removeItem('gymtracker_auth');
};