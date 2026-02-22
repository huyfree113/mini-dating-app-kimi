import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Calendar, Loader2, CheckCircle } from 'lucide-react';
import type { Profile, Match } from '@/types';
import { matchAPI } from '@/services/api';
import { toast } from 'sonner';

interface MatchListProps {
  currentUser: Profile | null;
  onNavigate: (view: string) => void;
  onSelectMatch: (match: Match) => void;
  profiles: Profile[];
}

export function MatchList({ currentUser, onNavigate, onSelectMatch, profiles }: MatchListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadMatches = async () => {
      try {
        const userMatches = await matchAPI.getByUser(currentUser.id);
        setMatches(userMatches);
      } catch (error) {
        console.error('Failed to load matches:', error);
        toast.error('Không thể tải danh sách match');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [currentUser]);

  const getOtherUser = (match: Match): Profile | undefined => {
    if (!currentUser) return undefined;
    const otherId = match.userAId === currentUser.id ? match.userBId : match.userAId;
    return profiles.find(p => p.id === otherId);
  };

  const hasScheduledDate = (match: Match): boolean => {
    return !!match.scheduledDate;
  };

  const handleSchedule = (match: Match) => {
    onSelectMatch(match);
    onNavigate('schedule');
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Cặp Đôi của bạn</h1>
            <p className="text-gray-600">Những người đã match với bạn</p>
          </div>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Chưa có cặp đôi nào.</p>
              <p className="text-gray-400 text-sm mb-4">
                Hãy thích những người bạn quan tâm để tạo match!
              </p>
              <Button 
                onClick={() => onNavigate('profiles')}
                className="bg-gradient-to-r from-pink-500 to-purple-500"
              >
                Khám phá ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => {
              const otherUser = getOtherUser(match);
              const scheduled = hasScheduledDate(match);
              
              if (!otherUser) return null;
              
              return (
                <Card key={match.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                          <CardDescription>{otherUser.age} tuổI</CardDescription>
                        </div>
                      </div>
                      {scheduled && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã hẹn
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">{otherUser.bio}</p>
                    
                    {scheduled ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-green-800 text-sm font-medium">
                          📅 Lịch hẹn đã đặt:
                        </p>
                        <p className="text-green-700 text-sm">
                          {match.scheduledDate?.date} lúc {match.scheduledDate?.startTime}
                        </p>
                      </div>
                    ) : null}
                    
                    <Button
                      onClick={() => handleSchedule(match)}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {scheduled ? 'Xem lịch hẹn' : 'Đặt lịch hẹn'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
