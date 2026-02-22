import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Calendar, UserPlus, LogIn } from 'lucide-react';
import type { Profile } from '@/types';

interface HomePageProps {
  currentUser: Profile | null;
  onNavigate: (view: string) => void;
  profiles: Profile[];
}

export function HomePage({ currentUser, onNavigate, profiles }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-full">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mini Dating App
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Tìm kiếm người đặc biệt của bạn. Kết nối, thích và hẹn hò!
          </p>
        </div>

        {/* Current User Info */}
        {currentUser && (
          <Card className="mb-8 border-pink-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-pink-700">Xin chào, {currentUser.name}! 👋</CardTitle>
              <CardDescription>
                Bạn đã đăng nhập với email: {currentUser.email}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-pink-600">{profiles.length}</p>
              <p className="text-gray-500 text-sm">Thành viên</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!currentUser && (
            <>
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-300 bg-white"
                onClick={() => onNavigate('login')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <LogIn className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Đăng nhập</CardTitle>
                  </div>
                  <CardDescription>
                    Đăng nhập vào tài khoản đã có để tiếp tục
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                    <LogIn className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-300 bg-white"
                onClick={() => onNavigate('create-profile')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-pink-100 p-3 rounded-full">
                      <UserPlus className="w-6 h-6 text-pink-600" />
                    </div>
                    <CardTitle className="text-xl">Tạo Profile</CardTitle>
                  </div>
                  <CardDescription>
                    Tạo profile mới để bắt đầu tìm kiếm người phù hợp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tạo Profile
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 bg-white ${!currentUser ? 'opacity-50' : ''}`}
            onClick={() => onNavigate('profiles')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Khám phá</CardTitle>
              </div>
              <CardDescription>
                Xem danh sách các profile và thả tim người bạn thích
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                disabled={!currentUser}
              >
                {currentUser ? 'Khám phá ngay' : 'Vui lòng đăng nhập trước'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-300 bg-white ${!currentUser ? 'opacity-50' : ''}`}
            onClick={() => onNavigate('matches')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-3 rounded-full">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Cặp đôi</CardTitle>
              </div>
              <CardDescription>
                Xem những người đã match với bạn và đặt lịch hẹn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                disabled={!currentUser}
              >
                {currentUser ? 'Xem cặp đôi' : 'Vui lòng đăng nhập trước'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-300 bg-white ${!currentUser ? 'opacity-50' : ''}`}
            onClick={() => onNavigate('schedule')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Lịch hẹn</CardTitle>
              </div>
              <CardDescription>
                Chọn thời gian rảnh và tìm slot phù hợp với cặp đôi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                disabled={!currentUser}
              >
                {currentUser ? 'Đặt lịch' : 'Vui lòng đăng nhập trước'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-500 text-sm">
          <p>Mini Dating App - Bài test kỹ thuật cho Clique83.com</p>
        </div>
      </div>
    </div>
  );
}
