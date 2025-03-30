import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="bg-dark-light/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-dark/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center space-x-2 group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span className="logo-text text-2xl md:text-3xl text-primary transition-all duration-300 group-hover:text-primary-light">Puulup</span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoading ? (
              // Show loading placeholder
              <div className="w-24 h-4 bg-dark animate-pulse rounded"></div>
            ) : isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-light hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-dark/30 font-medium ${
                    location.pathname === '/dashboard' ? 'bg-dark/40 text-primary' : ''
                  }`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/workouts" 
                  className={`text-light hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-dark/30 font-medium ${
                    location.pathname === '/workouts' ? 'bg-dark/40 text-primary' : ''
                  }`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Workouts
                </Link>
                <div className="relative ml-2">
                  <div 
                    className="flex items-center space-x-2 cursor-pointer bg-dark/20 hover:bg-dark/40 transition-colors duration-200 px-3 py-1.5 rounded-xl"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary shadow-md" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-md">
                        <User size={16} className="text-primary" />
                      </div>
                    )}
                    <ChevronDown size={16} className={`text-light-dark transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-light rounded-xl shadow-xl border border-dark/30 py-2 z-50">
                      <Link 
                        to="/profile"
                        className="block px-4 py-2 text-light hover:bg-dark/30 hover:text-primary transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          window.scrollTo(0, 0);
                        }}
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-secondary hover:bg-dark/30 hover:text-secondary-light transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`text-light hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-dark/30 ${location.pathname === '/' ? 'text-primary font-medium' : ''}`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Home
                </Link>
                <Link 
                  to="/signin" 
                  className="text-light hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-dark/30"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-instagram-button text-light px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:opacity-90 shadow-md hover:shadow-lg"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden flex items-center">
            {isLoading ? (
              // Show loading placeholder
              <div className="w-8 h-8 rounded-full bg-dark animate-pulse"></div>
            ) : isAuthenticated ? (
              <Link 
                to="/profile"
                className="relative"
                onClick={() => window.scrollTo(0, 0)}
              >
                <div className="relative">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-9 h-9 rounded-full object-cover border-2 border-primary shadow-md" 
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-md border border-primary/30">
                      <User size={18} className="text-primary" />
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/signin" 
                  className="text-light hover:text-primary transition-colors text-sm px-3 py-1.5 rounded-lg bg-dark/20"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-instagram-button text-light text-sm px-3 py-1.5 rounded-lg font-medium shadow-md"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;