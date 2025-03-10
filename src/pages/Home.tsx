import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Calendar, Activity, ArrowRight, Clock, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, User, Play, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock data for workout posts
const MOCK_POSTS = [
  {
    id: 1,
    user: {
      name: 'Sarah Wilson',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      handle: '@sarahfitness'
    },
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    caption: 'Morning workout complete! 💪 Started the day with a killer leg session. Remember, consistency is key! #fitness #workout #motivation',
    likes: 234,
    comments: 18,
    timeAgo: '2 hours ago',
    workout: {
      type: 'Leg Day',
      exercises: ['Squats: 4x12', 'Deadlifts: 3x10', 'Lunges: 3x15/leg']
    }
  },
  {
    id: 2,
    user: {
      name: 'Alex Rivera',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      handle: '@alexfit'
    },
    video: 'https://joy1.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190301_1_25_11_preview.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    caption: 'Perfect your deadlift form with these tips! 🏋️‍♂️ Watch the full tutorial and let me know if you have any questions. #deadlift #technique #fitness',
    likes: 567,
    comments: 45,
    timeAgo: '3 hours ago',
    workout: {
      type: 'Form Tutorial',
      exercises: ['Deadlift form breakdown', 'Common mistakes to avoid', 'Progressive overload tips']
    }
  },
  {
    id: 3,
    user: {
      name: 'Mike Chen',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      handle: '@mikefit'
    },
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    caption: 'Push day! Working on improving my bench press form. Thanks to everyone who joined my live session today! 🏋️‍♂️ #chest #workout #fitness',
    likes: 456,
    comments: 32,
    timeAgo: '5 hours ago',
    workout: {
      type: 'Push Day',
      exercises: ['Bench Press: 5x5', 'Shoulder Press: 4x12', 'Tricep Extensions: 3x15']
    }
  },
  {
    id: 4,
    user: {
      name: 'Lisa Chen',
      image: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      handle: '@lisafitness'
    },
    video: 'https://joy1.videvo.net/videvo_files/video/free/2019-05/large_watermarked/190516_06_AZ-LAGOA_PREVIEW_preview.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    caption: 'Quick HIIT cardio session! 🔥 20 minutes, no equipment needed. Save this for later and try it at home! #hiit #cardio #homeworkout',
    likes: 789,
    comments: 56,
    timeAgo: '6 hours ago',
    workout: {
      type: 'HIIT Cardio',
      exercises: ['Burpees: 45s', 'Mountain Climbers: 45s', 'Jump Squats: 45s', 'Rest: 15s']
    }
  },
  {
    id: 5,
    user: {
      name: 'Emma Thompson',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      handle: '@emmafit'
    },
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    caption: 'Cardio session complete! 🏃‍♀️ Mixed HIIT with steady-state cardio today. Feeling energized! #cardio #hiit #fitness',
    likes: 567,
    comments: 45,
    timeAgo: '8 hours ago',
    workout: {
      type: 'Cardio',
      exercises: ['HIIT: 20 mins', 'Treadmill: 5km', 'Jump Rope: 10 mins']
    }
  },
  {
    id: 6,
    user: {
      name: 'David Kim',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      handle: '@davidstrong'
    },
    video: 'https://joy1.videvo.net/videvo_files/video/free/2019-09/large_watermarked/190828_27_SuperTrees_HD_17_preview.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    caption: 'Full body mobility routine! 🧘‍♂️ This 10-minute sequence is perfect before your workouts. #mobility #flexibility #fitness',
    likes: 432,
    comments: 28,
    timeAgo: '10 hours ago',
    workout: {
      type: 'Mobility',
      exercises: ['Dynamic stretches', 'Joint mobility work', 'Foam rolling']
    }
  }
];

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set(MOCK_POSTS.filter(post => post.video).map(post => post.id)));

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  const handleSave = (postId: number) => {
    setSavedPosts(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      return newSaved;
    });
  };

  const toggleVideoMute = (postId: number) => {
    setMutedVideos(prev => {
      const newMuted = new Set(prev);
      if (newMuted.has(postId)) {
        newMuted.delete(postId);
      } else {
        newMuted.add(postId);
      }
      return newMuted;
    });
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark pt-4 sm:pt-6 pb-24">
        <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
          {/* Stories - Coming soon banner */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 mb-6 text-center">
            <p className="text-white text-sm">Stories feature coming soon! Share your workout moments.</p>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {MOCK_POSTS.map(post => (
              <div key={post.id} className="bg-dark-light rounded-xl overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={post.user.image} 
                      alt={post.user.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-light font-medium text-sm">{post.user.name}</p>
                      <p className="text-light-dark text-xs">{post.user.handle}</p>
                    </div>
                  </div>
                  <button className="text-light-dark hover:text-light">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Media */}
                <div className="aspect-square relative">
                  {post.video ? (
                    <>
                      <video 
                        src={post.video}
                        poster={post.thumbnail}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted={mutedVideos.has(post.id)}
                        playsInline
                      />
                      <button
                        onClick={() => toggleVideoMute(post.id)}
                        className="absolute bottom-4 right-4 bg-dark bg-opacity-50 p-2 rounded-full text-light hover:bg-opacity-75 transition-all"
                      >
                        {mutedVideos.has(post.id) ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                    </>
                  ) : (
                    <img 
                      src={post.image} 
                      alt="Workout" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`${likedPosts.has(post.id) ? 'text-red-500' : 'text-light-dark hover:text-light'}`}
                      >
                        <Heart size={24} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button className="text-light-dark hover:text-light">
                        <MessageCircle size={24} />
                      </button>
                      <button className="text-light-dark hover:text-light">
                        <Share2 size={24} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleSave(post.id)}
                      className={`${savedPosts.has(post.id) ? 'text-primary' : 'text-light-dark hover:text-light'}`}
                    >
                      <Bookmark size={24} fill={savedPosts.has(post.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Likes */}
                  <p className="text-light font-medium text-sm mb-2">
                    {post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes
                  </p>

                  {/* Caption */}
                  <p className="text-light text-sm mb-2">
                    <span className="font-medium mr-2">{post.user.handle}</span>
                    {post.caption}
                  </p>

                  {/* Workout Details */}
                  <div className="bg-dark rounded-lg p-3 mb-2">
                    <p className="text-primary text-xs font-medium mb-2">{post.workout.type}</p>
                    <div className="space-y-1">
                      {post.workout.exercises.map((exercise, index) => (
                        <p key={index} className="text-light-dark text-xs">{exercise}</p>
                      ))}
                    </div>
                  </div>

                  {/* Comments and Time */}
                  <button className="text-light-dark text-sm mb-1">
                    View all {post.comments} comments
                  </button>
                  <p className="text-light-dark text-xs">{post.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Choose <span className="text-primary">PuulUp</span>?</h2>
            <p className="text-light-dark max-w-2xl mx-auto text-sm sm:text-base">
              Our platform offers everything you need to create, manage, and track your fitness journey effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="card hover:shadow-xl transition-all duration-300 ease-in-out">
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
            Join PuulUp today and take the first step towards achieving your fitness goals.
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