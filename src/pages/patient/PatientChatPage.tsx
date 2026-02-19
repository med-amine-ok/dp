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
import { cn } from '@/lib/utils';
import { Send, Check, CheckCheck, Smile } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (!patientId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('patient_id', patientId)
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
        setMessages(mapped);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('chat_messages')
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
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              sender: newMsg.sender,
              message: newMsg.message,
              timestamp: newMsg.created_at,
              status: newMsg.status,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [patientId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
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
    <DashboardLayout role="patient">
      <div className="w-full h-[calc(100vh-7rem)] flex flex-col gap-4 max-w-[1600px] mx-auto">
        {!assignedDoctorId ? (
          // No Doctor Assigned
          <div className="space-y-6">
            <Card className="border-2 border-dashed border-warning/50 bg-warning/5">
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
            {/* Modern Header */}
            <Card className="border-none shadow-sm bg-background/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      {doctorInfo?.avatar_url ? (
                        <img src={doctorInfo.avatar_url} alt={doctorInfo.name_fr} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {doctorInfo?.name_fr?.charAt(0).toUpperCase() || 'D'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                  </div>

                  <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      {doctorInfo ? (language === 'ar' ? doctorInfo.name_ar : doctorInfo.name_fr) : 'Doctor'}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        {language === 'ar' ? 'متصل' : 'En ligne'}
                      </span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {doctorInfo?.specialization || t('chat.title')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col border-none shadow-md overflow-hidden bg-background/50 backdrop-blur-sm min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6 h-full">
                <div className="space-y-6">
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
                            'max-w-[70%] rounded-2xl px-5 py-3 shadow-sm relative group',
                            isUser
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                              : 'bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-foreground rounded-bl-sm'
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
              <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
                {/* Input Bar */}
                <div className="flex items-end gap-3 bg-secondary/30 p-2 rounded-[24px] border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>

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
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
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
