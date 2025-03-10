import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-dark-light shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            onClick={() => window.scrollTo(0, 0)}
          >
            <Dumbbell size={28} className="text-primary" />
            <span className="logo-text text-xl text-primary">Puulup</span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-light hover:text-primary transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/workouts" 
                  className="text-light hover:text-primary transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Workouts
                </Link>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={logout} 
                    className="text-secondary hover:text-secondary-light transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                  <div className="flex items-center">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                        <User size={16} className="text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className="text-light hover:text-primary transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-instagram-button text-light px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <div className="flex items-center">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;