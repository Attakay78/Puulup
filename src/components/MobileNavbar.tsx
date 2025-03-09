import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Dumbbell, User, LogOut } from 'lucide-react';

const MobileNavbar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-light shadow-lg z-40 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
            pathname === '/dashboard' ? 'text-primary' : 'text-light-dark'
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link 
          to="/create-plan" 
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
            pathname === '/create-plan' ? 'text-primary' : 'text-light-dark'
          }`}
        >
          <Dumbbell size={20} />
          <span className="text-xs mt-1">Workouts</span>
        </Link>
        
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
            pathname === '/' ? 'text-primary' : 'text-light-dark'
          }`}
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
        
        <button 
          onClick={logout}
          className="flex flex-col items-center justify-center w-1/4 py-2 text-light-dark"
        >
          <LogOut size={20} />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavbar;