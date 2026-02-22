import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, User, Loader2 } from 'lucide-react';
import type { Profile, Like } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { likeAPI } from '@/services/api';
import { toast } from 'sonner';

interface ProfileListProps {
  currentUser: Profile | null;
  onNavigate: (view: string) => void;
  profiles: Profile[];
}

export function ProfileList({ currentUser, onNavigate, profiles }: ProfileListProps) {
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [likingProfileId, setLikingProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load likes
        const userLikes = await likeAPI.getByUser(currentUser.id);
        
        // Set liked profiles
        const likedIds = new Set<string>(userLikes.map((l: Like) => l.toUserId));
        setLikedProfiles(likedIds);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleLike = async (profile: Profile) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập trước');
      onNavigate('login');
      return;
    }

    if (likedProfiles.has(profile.id)) return;

    setLikingProfileId(profile.id);

    try {
      const response = await likeAPI.create(currentUser.id, profile.id);
      
      if (response.success) {
        setLikedProfiles(new Set([...likedProfiles, profile.id]));
        
        if (response.isMatch && response.match) {
          setMatchedProfile(profile);
          setShowMatchDialog(true);
          toast.success('🎉 Match thành công!', {
            description: `Bạn và ${profile.name} đã thích nhau!`,
          });
        } else {
          toast.success('Đã thích!', {
            description: `Bạn đã thích ${profile.name}`,
          });
        }
      }
    } catch (error: any) {
      toast.error('Thất bại', {
        description: error.message || 'Không thể thích profile này',
      });
    } finally {
      setLikingProfileId(null);
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-700';
      case 'female': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter out current user from profiles
  const otherProfiles = currentUser 
    ? profiles.filter(p => p.id !== currentUser.id)
    : profiles;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onNavigate('home')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Khám phá</h1>
            <p className="text-gray-600">Tìm kiếm ngườI phù hợp vớI bạn</p>
          </div>
        </div>

        {/* Profile Grid */}
        {otherProfiles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Chưa có profile nào khác.</p>
              <p className="text-gray-400 text-sm">Hãy mờI bạn bè tham gia!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherProfiles.map((profile) => (
              <Card key={profile.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{profile.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{profile.age} tuổI</span>
                        <Badge variant="secondary" className={getGenderColor(profile.gender)}>
                          {getGenderLabel(profile.gender)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{profile.bio}</p>
                  <Button
                    onClick={() => handleLike(profile)}
                    disabled={likedProfiles.has(profile.id) || likingProfileId === profile.id}
                    className={`w-full ${
                      likedProfiles.has(profile.id)
                        ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                    }`}
                  >
                    {likingProfileId === profile.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Heart 
                        className={`w-4 h-4 mr-2 ${
                          likedProfiles.has(profile.id) ? '' : 'fill-white'
                        }`} 
                      />
                    )}
                    {likedProfiles.has(profile.id) ? 'Đã thích' : likingProfileId === profile.id ? 'Đang xử lý...' : 'Thích'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Match Dialog */}
        <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                🎉 It's a Match! 🎉
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                  {matchedProfile?.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowMatchDialog(false)}
              >
                Tiếp tục khám phá
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                onClick={() => {
                  setShowMatchDialog(false);
                  onNavigate('matches');
                }}
              >
                Xem cặp đôI
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
