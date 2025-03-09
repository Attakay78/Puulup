import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, LogOut, Edit, Save, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user profile here
    setIsEditing(false);
    // Show a success message or notification
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

        <div className="card mb-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-light">Edit Profile</h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-light-dark hover:text-secondary"
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
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Save size={18} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-light">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary-light flex items-center"
                >
                  <Edit size={18} className="mr-1" />
                  <span>Edit</span>
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
                      <p className="text-light">{user.contact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-light mb-4">Account</h2>
          
          <button
            onClick={handleLogout}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;