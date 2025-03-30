import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigationType } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomExercisesProvider } from './context/CustomExercisesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import { Home as HomeIcon, Dumbbell, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useEffect, lazy, Suspense } from 'react';

// Lazy load non-critical components
const CreatePlan = lazy(() => import('./pages/CreatePlan'));
const Profile = lazy(() => import('./pages/Profile'));
const Workouts = lazy(() => import('./pages/Workouts'));

// Loading fallback component
const LoadingFallback = () => (
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
const AppContent = () => {
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, isLoading } = useAuth();
  const showMobileNavbar = isAuthenticated && !isLoading && (pathname !== '/signin' && pathname !== '/signup');
  
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </main>
      {showMobileNavbar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-light shadow-lg z-40 pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center justify-center w-1/3 py-2 ${
                pathname === '/dashboard' ? 'text-primary' : 'text-light-dark'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            
            <Link 
              to="/workouts" 
              className={`flex flex-col items-center justify-center w-1/3 py-2 ${
                pathname === '/workouts' ? 'text-primary' : 'text-light-dark'
              }`}
            >
              <Dumbbell size={20} />
              <span className="text-xs mt-1">Workouts</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center w-1/3 py-2 ${
                pathname === '/profile' ? 'text-primary' : 'text-light-dark'
              }`}
            >
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      )}
      <footer className="bg-dark-light/95 backdrop-blur-sm text-light py-6 md:mt-0 mt-16 border-t border-dark/20 shadow-top">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-lg sm:text-xl mb-4 md:mb-2">
            <div className="relative overflow-hidden rounded-full p-0.5 bg-instagram-gradient shadow-md">
              <img 
                src="/puulup-logo.png" 
                alt="Puulup Logo" 
                className="h-6 w-6 rounded-full" 
                width="24"
                height="24"
                loading="lazy"
              />
            </div>
            <span className="logo-text text-xl text-primary">PuulUp</span>
          </div>
          <p className="text-light-dark text-sm">&copy; {new Date().getFullYear()} PuulUp. All rights reserved.</p>
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