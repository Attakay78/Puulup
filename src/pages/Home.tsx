import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Activity, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // If authenticated, we'll be redirected by the useEffect
  // Otherwise, show the marketing home page
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-light-dark text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Choose <span className="logo-text text-2xl text-primary">PuulUp</span>?</h2>
            <p className="text-light-dark max-w-2xl mx-auto text-sm sm:text-base">
              Our platform offers everything you need to create, manage, and track your fitness journey effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                  <img 
                    src="/puulup-logo.png" 
                    alt="Puulup Logo" 
                    className="h-8 sm:h-10 w-auto"
                  />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center text-light">Customized Workouts</h3>
              <p className="text-light-dark text-center text-sm sm:text-base">
                Create personalized workout plans with various exercise types, sets, reps, and durations.
              </p>
            </div>
            
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out">
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
            
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none">
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
      
      {/* CTA Section */}
      <div className="bg-instagram-gradient py-12 sm:py-20 text-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-light">
            Join <span className="logo-text text-2xl">PuulUp</span> today and take the first step towards achieving your fitness goals.
          </p>
          
          <Link 
            to="/signup" 
            className="bg-white text-primary inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
          >
            Get Started Now
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;