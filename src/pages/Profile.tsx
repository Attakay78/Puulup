import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, LogOut, Edit, Save, X, Dumbbell, UserCircle } from 'lucide-react';
import { updateUser } from '../api';
import CustomExerciseManager from '../components/CustomExerciseManager';

type TabType = 'profile' | 'workouts';

const Profile: React.FC = () => {
  const { user, logout, updateUser: updateUserContext } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
    profileImage: user?.profileImage || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to update user profile
      await updateUser({
        name: formData.name,
        contact: formData.contact,
        profileImage: formData.profileImage
      });
      
      // Update the user in context
      updateUserContext({
        name: formData.name,
        contact: formData.contact,
        profileImage: formData.profileImage
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark pt-10 pb-24 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-10">
            <p className="text-light-dark">You are not logged in.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-10 pb-24 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-light">Profile</h1>
          <p className="text-light-dark mt-2 text-sm sm:text-base">
            Manage your personal information
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">
            {success}
          </div>
        )}

        {/* Tab navigation - Enhanced for mobile */}
        <div className="bg-dark-light rounded-xl p-1.5 sm:p-2 flex justify-between mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center py-3 sm:py-2.5 px-2 sm:px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-instagram-gradient text-white shadow-lg' 
                : 'text-light-dark hover:text-light'
            }`}
            aria-label="Profile Details"
          >
            <UserCircle size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Profile Details</span>
            <span className="inline sm:hidden ml-1">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 flex items-center justify-center py-3 sm:py-2.5 px-2 sm:px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'workouts' 
                ? 'bg-instagram-gradient text-white shadow-lg' 
                : 'text-light-dark hover:text-light'
            }`}
            aria-label="Custom Workouts"
          >
            <Dumbbell size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Custom Workouts</span>
            <span className="inline sm:hidden ml-1">Workouts</span>
          </button>
        </div>

        {activeTab === 'profile' && (
          <>
            <div className="card mb-4 sm:mb-6">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-light">Edit Profile</h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-light-dark hover:text-secondary"
                      disabled={isLoading}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      {formData.profileImage ? (
                        <div className="relative">
                          <img
                            src={formData.profileImage}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            disabled={isLoading}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-dark hover:bg-dark-light border border-dark-light rounded-full p-4 flex flex-col items-center justify-center w-24 h-24 transition-colors">
                          <User size={24} className="text-light-dark mb-2" />
                          <span className="text-xs text-light-dark">Upload</span>
                          <input
                            id="profileImage"
                            name="profileImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-light mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-light-dark" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="input-field pl-10 text-sm"
                          placeholder="Your name"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-light mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-light-dark" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field pl-10 text-sm"
                          placeholder="you@example.com"
                          disabled={true}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-light mb-1">
                        Contact Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-light-dark" />
                        </div>
                        <input
                          id="contact"
                          name="contact"
                          type="tel"
                          required
                          value={formData.contact}
                          onChange={handleChange}
                          className="input-field pl-10 text-sm"
                          placeholder="555-123-4567"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="btn-primary w-full flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-light border-t-transparent animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-light">Personal Information</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:text-primary-light flex items-center"
                    >
                      <Edit size={16} className="sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>

                  <div className="flex flex-col items-center mb-6">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary mb-3"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mb-3">
                        <User size={32} className="text-primary" />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-light">{user.name}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-dark p-4 rounded-xl">
                      <div className="flex items-start">
                        <Mail size={18} className="text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-light-dark">Email</p>
                          <p className="text-light">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-dark p-4 rounded-xl">
                      <div className="flex items-start">
                        <Phone size={18} className="text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-light-dark">Contact</p>
                          <p className="text-light">{user.contact || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold text-light mb-4">Account</h2>
              
              <button
                onClick={handleLogout}
                className="btn-secondary w-full flex items-center justify-center"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </>
        )}

        {activeTab === 'workouts' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-light">Custom Workouts</h2>
              <div className="text-xs sm:text-sm text-light-dark bg-dark rounded-lg px-2 py-1">
                Add your own exercises
              </div>
            </div>
            <CustomExerciseManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;