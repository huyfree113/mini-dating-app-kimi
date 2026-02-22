import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Plus, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Profile, Match, AvailabilitySlot, ScheduledDate } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { matchAPI } from '@/services/api';
import { toast } from 'sonner';

interface ScheduleDateProps {
  currentUser: Profile | null;
  selectedMatch: Match | null;
  onNavigate: (view: string) => void;
  profiles: Profile[];
}

export function ScheduleDateComponent({ currentUser, selectedMatch, onNavigate, profiles }: ScheduleDateProps) {
  const [match, setMatch] = useState<Match | null>(selectedMatch);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [myAvailability, setMyAvailability] = useState<AvailabilitySlot[]>([]);
  const [otherAvailability, setOtherAvailability] = useState<AvailabilitySlot[]>([]);
  const [scheduledDate, setScheduledDate] = useState<ScheduledDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinding, setIsFinding] = useState(false);

  // Form state for new slot
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
  if (!currentUser) {
    setLoading(false);
    return;
  }

  if (selectedMatch) {
    loadMatchData(selectedMatch);
  } else {
    loadFirstMatch();
  }
}, [currentUser, selectedMatch]);

  const loadFirstMatch = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const userMatches = await matchAPI.getByUser(currentUser.id);
      if (userMatches && userMatches.length > 0) {
        await loadMatchData(userMatches[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      setLoading(false);
    }
  };

  const loadMatchData = async (matchData: Match) => {
    if (!currentUser) return;

    try {
      // Get fresh match data
      const freshMatch = await matchAPI.getById(matchData.id);
      
      // Check if match exists
      if (!freshMatch) {
        console.error('Match not found:', matchData.id);
        setLoading(false);
        return;
      }
      
      setMatch(freshMatch);

      // Load other user info
      const otherId = freshMatch.userAId === currentUser.id ? freshMatch.userBId : freshMatch.userAId;
      const other = profiles.find((p: Profile) => p.id === otherId);
      setOtherUser(other || null);

      // Load availability
      const isUserA = freshMatch.userAId === currentUser.id;
      setMyAvailability(isUserA ? (freshMatch.userAAvailability || []) : (freshMatch.userBAvailability || []));
      setOtherAvailability(isUserA ? (freshMatch.userBAvailability || []) : (freshMatch.userAAvailability || []));
      setScheduledDate(freshMatch.scheduledDate || null);
    } catch (error) {
      console.error('Failed to load match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!match || !currentUser) {
      toast.error('Không tìm thấy thông tin match');
      return;
    }

    // Validate time
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('Giờ bắt đầu phảI nhỏ hơn giờ kết thúc');
      return;
    }

    // Validate date is within 3 weeks
    const selectedDate = new Date(newSlot.date);
    const today = new Date();
    const threeWeeksLater = new Date();
    threeWeeksLater.setDate(today.getDate() + 21);

    if (selectedDate < today) {
      toast.error('Không thể chọn ngày trong quá khứ');
      return;
    }

    if (selectedDate > threeWeeksLater) {
      toast.error('Chỉ có thể chọn trong vòng 3 tuần tớI');
      return;
    }

    const slot: AvailabilitySlot = {
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    };

    const updated = [...myAvailability, slot];
    
    setIsSaving(true);
    try {
      await matchAPI.updateAvailability(match.id, currentUser.id, updated);
      setMyAvailability(updated);
      toast.success('Đã thêm khung giờ');
      
      // Reset form
      setNewSlot({ date: '', startTime: '', endTime: '' });
    } catch (error: any) {
      toast.error('Thất bại', {
        description: error.message || 'Không thể cập nhật',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeSlot = async (index: number) => {
    if (!match || !currentUser) {
      toast.error('Không tìm thấy thông tin match');
      return;
    }

    const updated = myAvailability.filter((_: AvailabilitySlot, i: number) => i !== index);
    
    setIsSaving(true);
    try {
      await matchAPI.updateAvailability(match.id, currentUser.id, updated);
      setMyAvailability(updated);
      toast.success('Đã xóa khung giờ');
    } catch (error: any) {
      toast.error('Thất bại', {
        description: error.message || 'Không thể cập nhật',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const findCommonSlot = async () => {
    if (!match) {
      toast.error('Không tìm thấy thông tin match');
      return;
    }

    if (otherAvailability.length === 0) {
      setResultMessage(`${otherUser?.name} chưa chọn thờI gian rảnh. Vui lòng chờ!`);
      setResultSuccess(false);
      setShowResultDialog(true);
      return;
    }

    setIsFinding(true);
    try {
      const response = await matchAPI.findCommonSlot(match.id);
      
      if (response && response.success && response.scheduledDate) {
        setScheduledDate(response.scheduledDate);
        setResultMessage(`Hai bạn có date hẹn vào: ${response.scheduledDate.date} lúc ${response.scheduledDate.startTime}`);
        setResultSuccess(true);
      } else {
        setResultMessage(response.message || 'Chưa tìm được thờI gian trùng. Vui lòng chọn lạI.');
        setResultSuccess(false);
      }
      
      setShowResultDialog(true);
    } catch (error: any) {
      toast.error('Thất bại', {
        description: error.message || 'Không thể tìm slot',
      });
    } finally {
      setIsFinding(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!match || !otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onNavigate('home')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Đặt lịch hẹn</h1>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Bạn chưa có cặp đôI nào.</p>
              <Button 
                onClick={() => onNavigate('profiles')}
                className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                Khám phá ngay
              </Button>
            </CardContent>
          </Card>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-800">Đặt lịch hẹn</h1>
            <p className="text-gray-600">Chọn thờI gian rảnh vớI {otherUser.name}</p>
          </div>
        </div>

        {/* Scheduled Date Display */}
        {scheduledDate && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Lịch hẹn đã được đặt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-lg">
                📅 {formatDate(scheduledDate.date)} lúc {scheduledDate.startTime}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Availability */}
          <Card>
            <CardHeader>
              <CardTitle>ThờI gian rảnh của bạn</CardTitle>
              <CardDescription>
                Chọn các khung giờ bạn rảnh trong 3 tuần tớI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Slot Form */}
              <div className="space-y-3 mb-4">
                <div>
                  <Label className="text-sm">Ngày</Label>
                  <Input
                    type="date"
                    value={newSlot.date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSlot({ ...newSlot, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    disabled={isSaving}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Từ</Label>
                    <Input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Đến</Label>
                    <Input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <Button 
                  onClick={addSlot}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  disabled={!newSlot.date || !newSlot.startTime || !newSlot.endTime || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Đang lưu...' : 'Thêm'}
                </Button>
              </div>

              {/* My Slots List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {myAvailability.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Chưa có khung giờ nào</p>
                ) : (
                  myAvailability.map((slot: AvailabilitySlot, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{formatDate(slot.date)}</p>
                        <p className="text-blue-600 text-sm">{slot.startTime} - {slot.endTime}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Other User's Availability */}
          <Card>
            <CardHeader>
              <CardTitle>ThờI gian rảnh của {otherUser.name}</CardTitle>
              <CardDescription>
                {otherAvailability.length === 0 
                  ? `${otherUser.name} chưa chọn thờI gian rảnh`
                  : `${otherUser.name} đã chọn ${otherAvailability.length} khung giờ`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {otherAvailability.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">Chưa có dữ liệu</p>
                  </div>
                ) : (
                  otherAvailability.map((slot: AvailabilitySlot, index: number) => (
                    <div 
                      key={index} 
                      className="bg-purple-50 p-3 rounded-lg"
                    >
                      <p className="font-medium text-sm">{formatDate(slot.date)}</p>
                      <p className="text-purple-600 text-sm">{slot.startTime} - {slot.endTime}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Find Common Slot Button */}
        {!scheduledDate && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <Button
                onClick={findCommonSlot}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                disabled={myAvailability.length === 0 || isFinding}
              >
                {isFinding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {isFinding ? 'Đang tìm...' : 'Tìm thờI gian trùng'}
              </Button>
              {myAvailability.length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-2">
                  Vui lòng thêm ít nhất một khung giờ rảnh
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Result Dialog */}
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={`text-center text-xl ${resultSuccess ? 'text-green-600' : 'text-orange-600'}`}>
                {resultSuccess ? '🎉 Chúc mừng! 🎉' : '⏰ Chưa tìm được'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center py-4">
              {resultSuccess ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-orange-500" />
              )}
            </div>
            <p className="text-center text-gray-700 mb-4">{resultMessage}</p>
            <Button 
              onClick={() => setShowResultDialog(false)}
              className={resultSuccess 
                ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
              }
            >
              Đóng
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
