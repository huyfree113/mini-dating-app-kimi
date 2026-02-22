import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import type { Profile } from '@/types';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

interface LoginPageProps {
  onNavigate: (view: string) => void;
  onLogin: (profile: Profile) => void;
  profiles: Profile[];
}

export function LoginPage({ onNavigate, onLogin, profiles }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(email.trim());
      if (response.success && response.profile) {
        onLogin(response.profile);
      }
    } catch (error: any) {
      toast.error('Đăng nhập thất bại', {
        description: error.message || 'Email không tồn tại. Vui lòng tạo profile mới.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>
        </div>

        <Card className="border-pink-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-3 rounded-full">
                <LogIn className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>
                  Nhập email để đăng nhập vào tài khoản của bạn
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Đang đăng nhập...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-500 text-sm mb-4">
                Chưa có tài khoản?
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('create-profile')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tạo profile mới
              </Button>
            </div>

            {/* Existing profiles hint */}
            {profiles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-center text-gray-500 text-sm mb-3">
                  Các email đã đăng ký:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setEmail(profile.email)}
                      className="w-full text-left p-2 rounded-lg hover:bg-pink-50 transition-colors text-sm"
                    >
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-gray-400 ml-2">{profile.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
