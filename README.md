# PuulUp Backend API

This is the backend API for the PuulUp fitness tracking application, built with FastAPI and SQLModel.

## Features

- User authentication with JWT tokens
- Workout plan management
- Exercise tracking
- Recurring workout scheduling
- Custom exercise creation

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set up environment variables (or use the defaults in .env)
4. Run the application:
   ```
   python run.py
   ```

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/token` - Get access token
- `POST /api/users` - Create a new user

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

### Exercises
- `POST /api/exercises` - Create a custom exercise
- `GET /api/exercises` - Get all exercises (default + custom)

### Workout Plans
- `POST /api/workout-plans` - Create a workout plan
- `GET /api/workout-plans` - Get all workout plans
- `GET /api/workout-plans/{plan_id}` - Get a specific workout plan
- `PUT /api/workout-plans/{plan_id}` - Update a workout plan
- `DELETE /api/workout-plans/{plan_id}` - Delete a workout plan

### Workouts
- `POST /api/workouts` - Create a workout
- `GET /api/workouts` - Get workouts (with optional filters)
- `GET /api/workouts/{workout_id}` - Get a specific workout
- `PUT /api/workouts/{workout_id}` - Update a workout
- `DELETE /api/workouts/{workout_id}` - Delete a workout

### Utilities
- `POST /api/generate-recurring-workouts` - Generate recurring workouts

## Database Schema

The application uses SQLModel with the following main models:

- **User**: Stores user information and authentication details
- **Exercise**: Represents an exercise (both default and custom)
- **WorkoutPlan**: A collection of workouts for a user
- **Workout**: A specific workout on a specific date with exercises

## Development

### Database Migrations

The project uses Alembic for database migrations:

```
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

### Running Tests

```
pytest
```