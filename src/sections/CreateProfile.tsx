import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import type { Profile } from '@/types';
import { profileAPI } from '@/services/api';
import { toast } from 'sonner';

interface CreateProfileProps {
  onNavigate: (view: string) => void;
  onProfileCreated: (profile: Profile) => void;
}

export function CreateProfile({ onNavigate, onProfileCreated }: CreateProfileProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bio: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }
    
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
      newErrors.age = 'TuổI phảI từ 18-100';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Vui lòng nhập mô tả';
    } else if (formData.bio.length > 200) {
      newErrors.bio = 'Mô tả tối đa 200 ký tự';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await profileAPI.create({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio.trim(),
        email: formData.email.trim(),
      });

      if (response.success && response.profile) {
        onProfileCreated(response.profile);
      }
    } catch (error: any) {
      toast.error('Tạo profile thất bại', {
        description: error.message || 'Có lỗI xảy ra. Vui lòng thử lạI.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-800">Tạo Profile</h1>
        </div>

        <Card className="border-pink-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-3 rounded-full">
                <UserPlus className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Điền thông tin để tạo profile của bạn
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên *</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên của bạn"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">TuổI *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Nhập tuổI"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={errors.age ? 'border-red-500' : ''}
                  min={18}
                  max={100}
                  disabled={isLoading}
                />
                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>GiớI tính *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female' | 'other') => 
                    setFormData({ ...formData, gender: value })
                  }
                  className="flex gap-4"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Nữ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">Khác</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Mô tả bản thân *</Label>
                <Textarea
                  id="bio"
                  placeholder="Hãy mô tả về bản thân bạn..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={errors.bio ? 'border-red-500' : ''}
                  rows={4}
                  maxLength={200}
                  disabled={isLoading}
                />
                <div className="flex justify-between">
                  {errors.bio ? (
                    <p className="text-red-500 text-sm">{errors.bio}</p>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-gray-400 text-sm">{formData.bio.length}/200</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <p className="text-gray-500 text-sm">Email dùng để đăng nhập</p>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Submit */}
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tạo Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
