import { useState, useEffect } from 'react';
import { HomePage } from '@/sections/HomePage';
import { CreateProfile } from '@/sections/CreateProfile';
import { ProfileList } from '@/sections/ProfileList';
import { MatchList } from '@/sections/MatchList';
import { ScheduleDateComponent } from '@/sections/ScheduleDate';
import { LoginPage } from '@/sections/LoginPage';
import type { Profile, Match, ViewState } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { profileAPI } from '@/services/api';
function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Load current user and profiles on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Load profiles
        const allProfiles = await profileAPI.getAll();
        setProfiles(allProfiles);
        
        // Check for stored user
        const storedUserId = localStorage.getItem('dating_app_current_user_id');
        if (storedUserId) {
          const user = allProfiles.find((p: Profile) => p.id === storedUserId);
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const handleNavigate = (view: string) => {
    // Fix: Prevent crash when navigating without profile
    if (view !== 'home' && view !== 'create-profile' && view !== 'login' && !currentUser) {
      toast.error('Vui lòng đăng nhập hoặc tạo profile trước!', {
        description: 'Bạn cần có tài khoản để sử dụng tính năng này.',
      });
      setCurrentView('login');
      return;
    }
    
    if (['home', 'create-profile', 'profiles', 'matches', 'schedule', 'login'].includes(view)) {
      setCurrentView(view as ViewState);
    }
  };

  const handleProfileCreated = (profile: Profile) => {
    setCurrentUser(profile);
    localStorage.setItem('dating_app_current_user_id', profile.id);
    setProfiles(prev => [...prev, profile]);
    toast.success('Profile đã được tạo thành công!', {
      description: `Chào mừng ${profile.name} đến với Mini Dating App`,
    });
    setCurrentView('home');
  };

  const handleLogin = (profile: Profile) => {
    setCurrentUser(profile);
    localStorage.setItem('dating_app_current_user_id', profile.id);
    toast.success('Đăng nhập thành công!', {
      description: `Chào mừng trở lại, ${profile.name}!`,
    });
    setCurrentView('home');
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleLogout = () => {
    localStorage.removeItem('dating_app_current_user_id');
    setCurrentUser(null);
    setCurrentView('home');
    toast.info('Đã đăng xuất');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigate('home')}
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </div>
              <span className="font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Mini Dating
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-full hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-sm text-pink-600 hover:text-pink-700 transition-colors px-3 py-1 rounded-full hover:bg-pink-50"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setCurrentView('create-profile')}
                    className="text-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full hover:from-pink-600 hover:to-purple-600 transition-colors"
                  >
                    Tạo profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'home' && (
          <HomePage 
            currentUser={currentUser} 
            onNavigate={handleNavigate} 
            profiles={profiles}
          />
        )}
        
        {currentView === 'login' && (
          <LoginPage 
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            profiles={profiles}
          />
        )}
        
        {currentView === 'create-profile' && (
          <CreateProfile 
            onNavigate={handleNavigate}
            onProfileCreated={handleProfileCreated}
          />
        )}
        
        {currentView === 'profiles' && (
          <ProfileList 
            currentUser={currentUser}
            onNavigate={handleNavigate}
            profiles={profiles}
          />
        )}
        
        {currentView === 'matches' && (
          <MatchList 
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSelectMatch={handleSelectMatch}
            profiles={profiles}
          />
        )}
        
        {currentView === 'schedule' && (
          <ScheduleDateComponent 
            currentUser={currentUser}
            selectedMatch={selectedMatch}
            onNavigate={handleNavigate}
            profiles={profiles}
          />
        )}
      </main>

      <Toaster position="top-center" />
    </>
  );
}

export default App;
