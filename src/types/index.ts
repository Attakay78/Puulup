export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  contact: string;
  profileImage?: string;
};

export type Exercise = {
  type: string;
  sets?: number;
  reps?: number;
  duration?: number;
  isCustom?: boolean;
};

// Legacy type - kept for backward compatibility
export type DayWorkout = {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  exercises: Exercise[];
};

// New date-based workout type
export type DateWorkout = {
  date: string; // ISO format: YYYY-MM-DD
  exercises: Exercise[];
  recurring?: RecurringType;
};

export type RecurringType = 'none' | 'weekly' | 'biweekly' | 'month';

// Legacy workout plan type - kept for backward compatibility
export type WorkoutPlan = {
  userId: string;
  workouts: DayWorkout[];
  customExercises?: string[];
};

// New date-based workout plan type
export type DateWorkoutPlan = {
  userId: string;
  workouts: DateWorkout[];
  customExercises?: string[];
};

export type AuthContextType = {
  user: Omit<User, 'password'> | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
};

export type WeekRange = {
  start: Date;
  end: Date;
};

// Backend API types
export type ApiExercise = {
  id: number;
  name: string;
  exercise_type: string;
  is_custom: boolean;
};

export type ApiWorkoutPlan = {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type ApiWorkout = {
  id: number;
  plan_id: number;
  date: string;
  recurring: RecurringType;
  exercises: Exercise[];
};