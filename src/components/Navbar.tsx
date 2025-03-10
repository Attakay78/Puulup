import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-dark-light shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary"
            onClick={() => window.scrollTo(0, 0)}
          >
            <Dumbbell size={28} className="text-primary" />
            <span>PuulUp</span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  {user?.profileImage && (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                    />
                  )}
                  <span className="font-medium text-light">{user?.name}</span>
                </div>
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
                <button 
                  onClick={logout} 
                  className="flex items-center space-x-1 text-secondary hover:text-secondary-light transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;