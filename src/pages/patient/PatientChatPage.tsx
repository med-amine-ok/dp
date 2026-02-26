import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import AssignDoctorCard from '@/components/AssignDoctorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Send, Check, CheckCheck, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface DoctorInfo {
  id: string;
  name_ar: string;
  name_fr: string;
  avatar_url: string;
  specialization?: string;
}

const PatientChatPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [assignedDoctorId, setAssignedDoctorId] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAutoScrolledMessageIdRef = useRef<string | null>(null);

  // Fetch Patient & Doctor Info
  useEffect(() => {
    if (!user) return;

    const fetchPatientInfo = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('patients')
          .select('id, assigned_doctor_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setPatientId(data.id);
          setAssignedDoctorId(data.assigned_doctor_id);

          // Fetch doctor details if assigned
          if (data.assigned_doctor_id) {
            // Try fetching from doctors table first
            let { data: doctor, error: doctorError } = await supabase
              .from('doctors')
              .select('*')
              .eq('id', data.assigned_doctor_id)
              .single();

            console.log('Doctor from doctors table:', { doctor, doctorError });

            // If not found in doctors table, try profiles table
            if (!doctor && doctorError) {
              const { data: profileDoctor, error: profileError } = await supabase
                .from('profiles')
                .select('id, name_ar, name_fr, avatar_url, user_id')
                .eq('user_id', data.assigned_doctor_id)
                .single();

              console.log('Doctor from profiles table:', { profileDoctor, profileError });

              if (profileError) throw profileError;
              if (profileDoctor) {
                setDoctorInfo({
                  id: profileDoctor.user_id || profileDoctor.id,
                  name_ar: profileDoctor.name_ar || '',
                  name_fr: profileDoctor.name_fr || '',
                  avatar_url: profileDoctor.avatar_url || '', // Google avatar from profiles
                  specialization: '',
                });
              }
            } else {
              if (doctorError) throw doctorError;
              if (doctor) {
                setDoctorInfo(doctor);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patient info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientInfo();
  }, [user]);

  // Fetch Messages & Subscribe
  useEffect(() => {
    if (!patientId || !assignedDoctorId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('patient_id', patientId)
        .eq('doctor_id', assignedDoctorId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        const mapped: Message[] = (data || []).map((msg: any) => ({
          id: msg.id,
          sender: msg.sender,
          message: msg.message,
          timestamp: msg.created_at,
          status: msg.status,
        }));
        setMessages((prev) => {
          const hasSameContent =
            prev.length === mapped.length &&
            prev.every((item, index) => {
              const nextItem = mapped[index];
              return (
                nextItem &&
                item.id === nextItem.id &&
                item.sender === nextItem.sender &&
                item.message === nextItem.message &&
                item.timestamp === nextItem.timestamp &&
                item.status === nextItem.status
              );
            });

          return hasSameContent ? prev : mapped;
        });
      }
    };

    fetchMessages();

    // Subscribe to new messages with unique channel name
    const channelName = `patient-chat:${patientId}:${assignedDoctorId}`;
    const subscription = supabase
      .channel(channelName, { config: { broadcast: { self: true } } })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          // Only add if it matches the current doctor
          if (newMsg.doctor_id === assignedDoctorId) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id,
                  sender: newMsg.sender,
                  message: newMsg.message,
                  timestamp: newMsg.created_at,
                  status: newMsg.status,
                },
              ];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Chat subscription status:', status);
      });

    // Fallback polling every 3 seconds for reliability
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [patientId, assignedDoctorId]);

  // Auto-scroll to bottom
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || lastAutoScrolledMessageIdRef.current === latestMessage.id) return;

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      lastAutoScrolledMessageIdRef.current = latestMessage.id;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !patientId || !assignedDoctorId) return;

    const text = newMessage;
    setNewMessage(''); // Clear input optimistically

    try {
      const { error } = await supabase.from('chat_messages').insert({
        patient_id: patientId,
        doctor_id: assignedDoctorId,
        sender: 'patient',
        message: text,
        status: 'sent',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(text); // Restore on error
    }
  };

  const handleQuickResponse = async (response: { labelFr: string; labelAr: string }) => {
    const messageText = language === 'ar' ? response.labelAr : response.labelFr;
    if (!patientId || !assignedDoctorId) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        patient_id: patientId,
        doctor_id: assignedDoctorId,
        sender: 'patient',
        message: messageText,
        status: 'sent',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending quick response:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout
      role="patient"
      headerContent={
        assignedDoctorId ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-[0_8px_18px_-14px_hsl(var(--primary)/0.85)]">
                {doctorInfo?.avatar_url ? (
                  <img src={doctorInfo.avatar_url} alt={doctorInfo.name_fr} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {doctorInfo?.name_fr?.charAt(0).toUpperCase() || 'D'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-background animate-pulse" />
            </div>

            <div className="min-w-0">
              <p className="text-sm md:text-base font-semibold leading-tight text-foreground truncate">
                {doctorInfo ? (language === 'ar' ? doctorInfo.name_ar : doctorInfo.name_fr) : 'Doctor'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {doctorInfo?.specialization || t('chat.title')}
              </p>
            </div>

            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-success/15 text-success text-[11px] font-semibold whitespace-nowrap">
              {language === 'ar' ? 'متصل' : 'En ligne'}
            </span>
          </div>
        ) : null
      }
    >
      <div className="w-full h-full min-h-0 flex flex-col gap-3 max-w-[1600px] mx-auto overflow-hidden">
        {!assignedDoctorId ? (
          // No Doctor Assigned
          <div className="space-y-6 overflow-auto">
            <Card className="border-2 border-dashed border-warning/40 bg-warning/5 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-warning">
                  {language === 'ar' ? 'لم يتم تعيين طبيب' : 'Pas de médecin assigné'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {language === 'ar'
                    ? 'يجب تعيين طبيب أولاً لتتمكن من التواصل معه. اذهب إلى لوحة التحكم واختر طبيبك.'
                    : 'Vous devez d\'abord assigner un médecin pour pouvoir communiquer. Retournez au tableau de bord et sélectionnez votre médecin.'}
                </p>
                <div className="max-w-md">
                  <AssignDoctorCard />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <Card className="flex-1 flex flex-col border border-border/70 card-shadow overflow-hidden bg-card/70 backdrop-blur-md rounded-3xl">
              {/* Messages - Only scrollable area */}
              <ScrollArea className="flex-1">
                <div className="p-6 md:p-7 space-y-6 medical-illustration-soft">
                  {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'patient';
                    const showAvatar = !isUser && (idx === 0 || messages[idx - 1].sender === 'patient');

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-3 items-end transition-all duration-300 hover:translate-y-[-1px]',
                          isUser ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        {!isUser && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar ? (
                              <Avatar className="w-8 h-8">
                                {doctorInfo?.avatar_url ? (
                                  <img src={doctorInfo.avatar_url} alt={doctorInfo.name_fr} className="w-full h-full object-cover" />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {doctorInfo?.name_fr?.charAt(0).toUpperCase() || 'D'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            ) : <div className="w-8" />}
                          </div>
                        )}

                        <div
                          className={cn(
                            'max-w-[72%] rounded-3xl px-5 py-3.5 shadow-sm relative group border transition-all duration-200',
                            isUser
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md border-primary/30 shadow-[0_14px_24px_-18px_hsl(var(--primary)/0.95)]'
                              : 'bg-card border-border/75 text-foreground rounded-bl-md'
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>

                          <div className={cn(
                            'flex items-center gap-1 mt-1 text-[10px]',
                            isUser ? 'text-primary-foreground/80 justify-end' : 'text-muted-foreground justify-start'
                          )}>
                            <span>{formatTime(msg.timestamp)}</span>
                            {isUser && (
                              <span className="ml-1">
                                {getStatusIcon(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Quick Responses & Input - Fixed at bottom */}
              <div className="p-4 bg-card/85 backdrop-blur-lg border-t border-border/60 flex-shrink-0">
                {/* Input Bar */}
                <div className="flex items-end gap-3 bg-background/80 p-2 rounded-[24px] border border-border/65 focus-within:ring-2 focus-within:ring-primary/25 transition-all card-shadow">
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors',
                          showEmojiPicker && 'text-primary bg-primary/10'
                        )}
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="p-0 border-none shadow-2xl w-auto"
                      sideOffset={12}
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData: EmojiClickData) => {
                          setNewMessage(prev => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme={Theme.LIGHT}
                        searchPlaceholder={language === 'ar' ? 'ابحث عن إيموجي...' : 'Chercher un emoji...'}
                        skinTonesDisabled
                        height={380}
                        width={320}
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    placeholder={t('chat.placeholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 min-h-[40px] py-3 px-0 resize-none"
                  />

                  <Button
                    onClick={handleSend}
                    size="icon"
                    disabled={!newMessage.trim()}
                    className={cn(
                      "h-10 w-10 rounded-full transition-all duration-200 shadow-sm",
                      newMessage.trim()
                        ? "bg-primary text-primary-foreground hover:bg-primary/92 hover:scale-105"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientChatPage;
