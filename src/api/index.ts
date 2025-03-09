import { User, WorkoutPlan, DateWorkoutPlan, DateWorkout, RecurringType, Exercise } from '../types';
import { formatGMTDateToISO, getCurrentGMTDate } from '../utils/dateUtils';

// Base URL for API requests
const API_BASE_URL = 'https://karyde.com/gym';

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
  
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  });
  
  if (!response.ok) {
    // Handle 401 Unauthorized by redirecting to login
    if (response.status === 401) {
      localStorage.removeItem('gymtracker_auth');
      window.location.href = '/signin';
      throw new Error('Session expired. Please login again.');
    }
    
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }
  
  return response.json();
};

// Simulate network delay for development
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate recurring workout dates
export const generateRecurringDates = (
  startDate: string,
  recurringType: RecurringType,
): string[] => {
  if (recurringType === 'none') return [startDate];
  
  const dates: string[] = [startDate];
  
  // Make API call to generate recurring dates
  // This is handled on the backend now
  return dates;
};

// Signup API
export const signup = async (userData: Omit<User, 'id'>) => {
  try {
    await delay(500); // Simulate network delay
    
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
    await delay(500); // Simulate network delay
    
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
        contact: data.contact || ''
      }
    }));
    
    return {
      token: data.access_token,
      user: {
        id: data.user_id.toString(),
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        contact: data.contact || ''
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
    await delay(300); // Simulate network delay
    
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

// Get workout plan API
export const getWorkoutPlan = async (userId: string) => {
  try {
    await delay(300); // Simulate network delay
    
    // Get all workout plans for the user
    const plans = await apiRequest('workout-plans');
    
    // If no plans exist, create a default one
    if (plans.length === 0) {
      const newPlan = await apiRequest('workout-plans', {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Workout Plan',
          description: 'Default workout plan'
        }),
      });
      
      return { 
        userId, 
        workouts: [], 
        customExercises: [] 
      } as DateWorkoutPlan;
    }
    
    // Use the first plan
    const planId = plans[0].id;
    
    // Get all workouts for this plan
    const workouts = await apiRequest(`workouts?plan_id=${planId}`);
    
    // Get all custom exercises
    const allExercises = await apiRequest('exercises');
    const customExercises = allExercises
      .filter((ex: any) => ex.is_custom)
      .map((ex: any) => ex.name);
    
    // Format workouts to match the frontend format
    const formattedWorkouts = workouts.map((workout: any) => ({
      date: workout.date,
      exercises: workout.exercises,
      recurring: workout.recurring
    }));
    
    return {
      userId,
      workouts: formattedWorkouts,
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
    await delay(300); // Simulate network delay
    
    // Get all workout plans for the user
    const plans = await apiRequest('workout-plans');
    
    if (plans.length === 0) {
      return [];
    }
    
    // Use the first plan
    const planId = plans[0].id;
    
    // Get workouts for the date range
    const workouts = await apiRequest(`workouts?plan_id=${planId}&start_date=${startDate}&end_date=${endDate}`);
    
    // Format workouts to match the frontend format
    return workouts.map((workout: any) => ({
      date: workout.date,
      exercises: workout.exercises,
      recurring: workout.recurring
    }));
  } catch (error) {
    console.error('Get workouts for date range error:', error);
    return [];
  }
};

// Save workout plan API
export const saveDateWorkoutPlan = async (workoutPlan: DateWorkoutPlan) => {
  try {
    await delay(500); // Simulate network delay
    
    // Get or create a workout plan
    let plans = await apiRequest('workout-plans');
    let planId: number;
    
    if (plans.length === 0) {
      // Create a new plan
      const newPlan = await apiRequest('workout-plans', {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Workout Plan',
          description: 'Custom workout plan'
        }),
      });
      planId = newPlan.id;
    } else {
      // Use the first existing plan
      planId = plans[0].id;
    }
    
    // Get existing workouts to determine what to update/delete/create
    const existingWorkouts = await apiRequest(`workouts?plan_id=${planId}`);
    const existingWorkoutMap = new Map(existingWorkouts.map((w: any) => [w.date, w]));
    
    // Create or update custom exercises
    if (workoutPlan.customExercises && workoutPlan.customExercises.length > 0) {
      // Get existing custom exercises
      const allExercises = await apiRequest('exercises');
      const existingCustomExercises = new Set(
        allExercises
          .filter((ex: any) => ex.is_custom)
          .map((ex: any) => ex.name)
      );
      
      // Create new custom exercises
      for (const exerciseName of workoutPlan.customExercises) {
        if (!existingCustomExercises.has(exerciseName)) {
          await apiRequest('exercises', {
            method: 'POST',
            body: JSON.stringify({
              name: exerciseName,
              exercise_type: 'strength' // Default to strength, can be refined later
            }),
          });
        }
      }
    }
    
    // Process each workout in the plan
    for (const workout of workoutPlan.workouts) {
      const existingWorkout = existingWorkoutMap.get(workout.date);
      
      if (existingWorkout) {
        // Update existing workout
        await apiRequest(`workouts/${existingWorkout.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            exercises: workout.exercises,
            recurring: workout.recurring
          }),
        });
        
        // Remove from map to track what's been processed
        existingWorkoutMap.delete(workout.date);
      } else {
        // Create new workout
        await apiRequest('workouts', {
          method: 'POST',
          body: JSON.stringify({
            plan_id: planId,
            date: workout.date,
            exercises: workout.exercises,
            recurring: workout.recurring
          }),
        });
      }
    }
    
    // Delete workouts that are no longer in the plan
    for (const [date, workout] of existingWorkoutMap.entries()) {
      await apiRequest(`workouts/${workout.id}`, {
        method: 'DELETE',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Save workout plan error:', error);
    throw error;
  }
};

// Add a workout to a specific date with recurring option
export const addWorkout = async (
  userId: string, 
  date: string, 
  exercises: DateWorkout['exercises'],
  recurring: RecurringType = 'none'
) => {
  try {
    await delay(300); // Simulate network delay
    
    // Get or create a workout plan
    let plans = await apiRequest('workout-plans');
    let planId: number;
    
    if (plans.length === 0) {
      // Create a new plan
      const newPlan = await apiRequest('workout-plans', {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Workout Plan',
          description: 'Custom workout plan'
        }),
      });
      planId = newPlan.id;
    } else {
      // Use the first existing plan
      planId = plans[0].id;
    }
    
    // Check if a workout already exists for this date
    const existingWorkouts = await apiRequest(`workouts?plan_id=${planId}&start_date=${date}&end_date=${date}`);
    
    if (existingWorkouts.length > 0) {
      // Update existing workout
      const workoutId = existingWorkouts[0].id;
      await apiRequest(`workouts/${workoutId}`, {
        method: 'PUT',
        body: JSON.stringify({
          exercises: exercises,
          recurring: recurring
        }),
      });
      
      // If recurring, generate additional workouts
      if (recurring !== 'none') {
        await apiRequest('generate-recurring-workouts', {
          method: 'POST',
          body: JSON.stringify({
            workout_id: workoutId
          }),
        });
      }
    } else {
      // Create new workout
      const newWorkout = await apiRequest('workouts', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: planId,
          date: date,
          exercises: exercises,
          recurring: recurring
        }),
      });
      
      // If recurring, generate additional workouts
      if (recurring !== 'none') {
        await apiRequest('generate-recurring-workouts', {
          method: 'POST',
          body: JSON.stringify({
            workout_id: newWorkout.id
          }),
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Add workout error:', error);
    throw error;
  }
};

// Delete a workout for a specific date
export const deleteWorkout = async (userId: string, date: string) => {
  try {
    await delay(300); // Simulate network delay
    
    // Get all workout plans for the user
    const plans = await apiRequest('workout-plans');
    
    if (plans.length === 0) {
      return { success: true }; // No plans, nothing to delete
    }
    
    // Use the first plan
    const planId = plans[0].id;
    
    // Find the workout for this date
    const workouts = await apiRequest(`workouts?plan_id=${planId}&start_date=${date}&end_date=${date}`);
    
    if (workouts.length > 0) {
      // Delete the workout
      await apiRequest(`workouts/${workouts[0].id}`, {
        method: 'DELETE',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Delete workout error:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const auth = localStorage.getItem('gymtracker_auth');
  return !!auth;
};

// Get current user
export const getCurrentUser = () => {
  const auth = localStorage.getItem('gymtracker_auth');
  if (!auth) return null;
  
  return JSON.parse(auth).user;
};

// Logout
export const logout = () => {
  localStorage.removeItem('gymtracker_auth');
};