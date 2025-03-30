export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  contact: string;
  profileImage?: string;
};

export type CacheUserInfo = {
  id: string;
  name: string;
  email: string;
  contact: string;
  profileImage?: string;
  planId: string;
};

export enum ExerciseType {
  STRENGTH = "strength",
  CARDIO = "cardio"
}

export enum WorkoutStatus {
  DONE = "Done",
  UNDONE = "Undone"
}

export type RecurringType = 'none' | number;

export type Exercise = {
  id?: number;
  type: string;
  sets?: number;
  reps?: number;
  duration?: number;
  isCustom?: boolean;
  status?: WorkoutStatus;
  recurring?: RecurringType;
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
};

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
  planId?: string;
};

export type AuthContextType = {
  user: Omit<CacheUserInfo, 'password'> | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (userData: Partial<NonNullable<Omit<User, 'password'>>>) => void;
};

export type WeekRange = {
  start: Date;
  end: Date;
};

// Backend API types
export type ApiExercise = {
  id: number;
  name: string;
  exercise_type: ExerciseType;
  is_custom: boolean;
  user_id: number | null;
};

export type ApiWorkoutPlan = {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type ApiWorkout = {
  id: number;
  plan_id: number;
  date: string;
};

export type ApiUserWorkout = {
  id: number;
  workout_id: number;
  exercise_id: number;
  sets: number | null;
  reps: number | null;
  duration: number | null; // in minutes
  status: WorkoutStatus;
  workout_date: string; // Added to support direct date access
};

export type ApiWorkoutWithExercises = {
  date: string;
  plan_id: number;
  exercises: Array<{
    exercise_id: number;
    sets?: number;
    reps?: number;
    duration?: number;
    status?: WorkoutStatus;
  }>;
};

export type ApiMultiDateWorkout = {
  dates: string[];
  plan_id: number;
  exercises: Array<{
    exercise_id: number;
    sets?: number;
    reps?: number;
    duration?: number;
    status?: WorkoutStatus;
  }>;
};

export type ApiToken = {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
  profile_image: string | null;
  plan_id: string;
};

export type ApiError = {
  detail: string;
};

// Type for the grouped workouts by date from the new endpoint
export type ApiGroupedWorkout = {
  date: string;
  exercises: Array<{
    id: number;
    exercise_id: number;
    sets: number | null;
    reps: number | null;
    duration: number | null;
    status: WorkoutStatus;
    type: string;
    isCustom: boolean;
  }>;
};