import { Link } from 'react-router-dom';
import { Dumbbell, Calendar, Activity, ArrowRight, Clock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-dark to-dark-light text-light py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                Transform Your <span className="text-primary">Fitness Journey</span> Today
              </h1>
              <p className="text-base sm:text-xl mb-6 sm:mb-8 text-light-dark max-w-lg mx-auto md:mx-0">
                Create personalized workout plans, track your progress, and achieve your fitness goals with PuulUp.
              </p>
              
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="bg-instagram-gradient inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base text-light"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4">
                  <Link 
                    to="/signin" 
                    className="btn-outline text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-instagram-gradient px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base text-light"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Fitness Training" 
                className="rounded-3xl shadow-xl transform md:rotate-3 hover:rotate-0 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Choose <span className="text-primary">PuulUp</span>?</h2>
            <p className="text-light-dark max-w-2xl mx-auto text-sm sm:text-base">
              Our platform offers everything you need to create, manage, and track your fitness journey effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 active:translate-y-0 active:shadow-md">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                  <Dumbbell size={24} className="text-primary" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-light">Customized Workouts</h3>
              <p className="text-light-dark text-center text-sm sm:text-base">
                Create personalized workout plans with various exercise types, sets, reps, and durations.
              </p>
            </div>
            
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 active:translate-y-0 active:shadow-md">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center">
                  <Calendar size={24} className="text-secondary" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-light">Weekly Schedule</h3>
              <p className="text-light-dark text-center text-sm sm:text-base">
                Organize your workouts in a weekly calendar view to stay consistent with your fitness routine.
              </p>
            </div>
            
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 active:translate-y-0 active:shadow-md sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <Activity size={24} className="text-green-500" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-light">Progress Tracking</h3>
              <p className="text-light-dark text-center text-sm sm:text-base">
                Monitor your fitness journey with detailed workout summaries and progress indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Workout Types Section */}
      <div className="bg-dark py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-light">Workout Types</h2>
            <p className="text-light-dark max-w-2xl mx-auto text-sm sm:text-base">
              Choose from a variety of workout types to create a balanced fitness routine.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-light rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0 active:shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Strength Training" 
                className="w-full h-36 sm:h-48 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-light">Strength Training</h3>
                <p className="text-light-dark mb-4 text-sm sm:text-base">
                  Build muscle and increase strength with exercises like Bench Press, Squats, and Deadlifts.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-light-dark">
                  <Clock size={14} className="mr-1" />
                  <span>30-60 minutes</span>
                  <Heart size={14} className="ml-3 sm:ml-4 mr-1 text-primary" />
                  <span>High intensity</span>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-light rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0 active:shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Cardio" 
                className="w-full h-36 sm:h-48 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-light">Cardio</h3>
                <p className="text-light-dark mb-4 text-sm sm:text-base">
                  Improve heart health and burn calories with Treadmill running and other cardio exercises.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-light-dark">
                  <Clock size={14} className="mr-1" />
                  <span>20-45 minutes</span>
                  <Heart size={14} className="ml-3 sm:ml-4 mr-1 text-primary" />
                  <span>Moderate intensity</span>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-light rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0 active:shadow-md sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none">
              <img 
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Cycling" 
                className="w-full h-36 sm:h-48 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-light">Cycling</h3>
                <p className="text-light-dark mb-4 text-sm sm:text-base">
                  Build endurance and leg strength with indoor or outdoor cycling sessions.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-light-dark">
                  <Clock size={14} className="mr-1" />
                  <span>30-60 minutes</span>
                  <Heart size={14} className="ml-3 sm:ml-4 mr-1 text-primary" />
                  <span>Adjustable intensity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-instagram-gradient py-12 sm:py-20 text-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-light">
            Join PuulUp today and take the first step towards achieving your fitness goals.
          </p>
          
          {!isAuthenticated && (
            <Link 
              to="/signup" 
              className="bg-white text-primary inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
            >
              Get Started Now
              <ArrowRight className="ml-2" size={16} />
            </Link>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-dark text-light py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-lg sm:text-xl font-bold mb-4 md:mb-0">
              <Dumbbell size={24} className="text-primary" />
              <span>PuulUp</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} PuulUp. All rights reserved.</p>
              <p className="text-xs sm:text-sm text-light-dark mt-1">
                Designed for fitness enthusiasts, by fitness enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;