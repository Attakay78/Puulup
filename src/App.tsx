import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigationType } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomExercisesProvider } from './context/CustomExercisesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import { Home as HomeIcon, Dumbbell, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';

// ScrollToTop component to reset scroll position on navigation
const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    // Always scroll to top when location changes
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
};

// Component to conditionally render the mobile navbar
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className={`flex-grow pt-16 md:pt-20 ${isAuthenticated && isSmallScreen ? 'pb-16' : ''} ${pathname === '/signin' || pathname === '/signup' ? 'flex flex-col' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-plan" 
            element={
              <ProtectedRoute>
                <CreatePlan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workouts" 
            element={
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isAuthenticated && isSmallScreen && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-light/95 backdrop-blur-md border-t border-dark/20 shadow-lg z-50">
          <div className="flex justify-around">
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center justify-center py-3 px-4 relative ${
                pathname === '/dashboard' 
                  ? 'text-primary font-medium transition-colors' 
                  : 'text-light-dark hover:text-light active:text-primary transition-colors'
              }`}
            >
              <LayoutDashboard 
                size={22} 
                className={`transition-transform duration-200 ${pathname === '/dashboard' ? 'scale-110' : ''}`}
              />
              <span className={`text-xs mt-1 transition-all duration-200 ${pathname === '/dashboard' ? 'font-medium' : ''}`}>Dashboard</span>
            </Link>
            
            <Link 
              to="/workouts" 
              className={`flex flex-col items-center justify-center py-3 px-4 relative ${
                pathname === '/workouts' 
                  ? 'text-primary font-medium transition-colors' 
                  : 'text-light-dark hover:text-light active:text-primary transition-colors'
              }`}
            >
              <Dumbbell 
                size={22} 
                className={`transition-transform duration-200 ${pathname === '/workouts' ? 'scale-110' : ''}`}
              />
              <span className={`text-xs mt-1 transition-all duration-200 ${pathname === '/workouts' ? 'font-medium' : ''}`}>Workouts</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center py-3 px-4 relative ${
                pathname === '/profile' 
                  ? 'text-primary font-medium transition-colors' 
                  : 'text-light-dark hover:text-light active:text-primary transition-colors'
              }`}
            >
              <User 
                size={22} 
                className={`transition-transform duration-200 ${pathname === '/profile' ? 'scale-110' : ''}`}
              />
              <span className={`text-xs mt-1 transition-all duration-200 ${pathname === '/profile' ? 'font-medium' : ''}`}>Profile</span>
            </Link>
          </div>
        </div>
      )}
      <footer className={`bg-dark-light/95 backdrop-blur-sm text-light py-4 border-t border-dark/20 shadow-top select-none mt-auto ${isAuthenticated && isSmallScreen ? 'pb-16' : ''}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="logo-text text-2xl text-primary select-none">Puulup</span>
          </div>
          <p className="text-light-dark text-xs">&copy; {new Date().getFullYear()} Puulup. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CustomExercisesProvider>
        <Router>
          <AppContent />
        </Router>
      </CustomExercisesProvider>
    </AuthProvider>
  );
}

export default App;