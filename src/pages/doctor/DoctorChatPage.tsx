import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, MessageCircle, Check, CheckCheck, Smile, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  status: 'active' | 'recovering' | 'critical';
  last_session?: string;
}

const DoctorChatPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAutoScrolledMessageIdRef = useRef<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const messageTemplates = [
    { labelFr: 'Comment te sens-tu aujourd\'hui ?', labelAr: 'كيف تشعر اليوم؟' },
    { labelFr: 'N\'oublie pas de boire de l\'eau', labelAr: 'لا تنسى شرب الماء' },
    { labelFr: 'Ta prochaine séance est prévue', labelAr: 'جلستك القادمة مقررة' },
    { labelFr: 'Très bien, continue comme ça !', labelAr: 'جيد جداً، استمر هكذا!' },
  ];

  // 1. Fetch Doctor ID and Assigned Patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorError) throw doctorError;
        setDoctorId(doctorData.id);

        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('assigned_doctor_id', doctorData.id);

        if (patientsError) throw patientsError;

        if (patientsData) {
          setPatients(patientsData);
          if (patientsData.length > 0) {
            setSelectedPatient(patientsData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  // 2. Fetch Messages & Subscribe when patient is selected
  useEffect(() => {
    if (!selectedPatient || !doctorId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .eq('doctor_id', doctorId)
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

    // Subscription with unique channel name and better error handling
    const channelName = `doctor-chat:${selectedPatient.id}:${doctorId}`;
    const subscription = supabase
      .channel(channelName, { config: { broadcast: { self: true } } })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `patient_id=eq.${selectedPatient.id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          // Only add if it's for this patient with this doctor
          if (newMsg.doctor_id === doctorId) {
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
        console.log('Doctor chat subscription status for patient:', selectedPatient.id, status);
      });

    // Fallback polling every 3 seconds for reliability
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [selectedPatient, doctorId]);

  // Scroll to bottom
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || lastAutoScrolledMessageIdRef.current === latestMessage.id) return;

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      lastAutoScrolledMessageIdRef.current = latestMessage.id;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedPatient || !doctorId) return;

    const text = newMessage;
    setNewMessage(''); // Optimistic clear

    try {
      const { error } = await supabase.from('chat_messages').insert({
        patient_id: selectedPatient.id,
        doctor_id: doctorId,
        sender: 'doctor',
        message: text,
        status: 'sent',
      });

      if (error) throw error;

      // No need to manually add if subscription is working, but can be safer
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(text); // Restore
    }
  };

  const handleTemplate = (template: { labelFr: string; labelAr: string }) => {
    setNewMessage(language === 'ar' ? template.labelAr : template.labelFr);
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

  // Header content for the nav bar – shows selected patient info
  const patientHeaderContent = selectedPatient ? (
    <div className="flex items-center gap-3">
      <Avatar className="w-9 h-9 ring-2 ring-primary/30">
        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
          {(language === 'ar' ? selectedPatient.name_ar : selectedPatient.name_fr).charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className="font-semibold text-foreground text-sm leading-tight">
          {language === 'ar' ? selectedPatient.name_ar : selectedPatient.name_fr}
        </span>
        <StatusBadge status={selectedPatient.status} />
      </div>
    </div>
  ) : undefined;

  return (
    <DashboardLayout role="doctor" headerContent={patientHeaderContent}>
      <div
        className={cn(
          'grid grid-rows-[auto_1fr] md:grid-rows-1 gap-3 md:gap-4 h-full overflow-hidden transition-all duration-300',
          showNames ? 'md:grid-cols-[240px_1fr]' : 'md:grid-cols-[72px_1fr]'
        )}
      >
          {/* Patients List */}
          <Card className="card-shadow overflow-hidden flex flex-col rounded-3xl border-border/70">
            <div className="p-3 border-b border-border/70 flex-shrink-0 bg-card/75 backdrop-blur-sm flex items-center justify-between">
              {showNames && (
                <h2 className="hidden md:flex font-semibold text-foreground items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  {language === 'ar' ? 'المحادثات' : 'Conversations'}
                </h2>
              )}
              <h2 className="md:hidden font-semibold text-foreground flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                {language === 'ar' ? 'المرضى' : 'Patients'}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNames(!showNames)}
                className="md:hidden h-8 px-2 text-xs text-muted-foreground hover:text-primary"
              >
                {showNames
                  ? (language === 'ar' ? 'إخفاء الأسماء' : 'Hide names')
                  : (language === 'ar' ? 'إظهار الأسماء' : 'Full names')}
              </Button>
              <button
                onClick={() => setShowNames(!showNames)}
                title={showNames ? (language === 'ar' ? 'إخفاء الأسماء' : 'Masquer les noms') : (language === 'ar' ? 'إظهار الأسماء' : 'Afficher les noms')}
                className={cn(
                  'hidden md:flex h-8 w-8 rounded-xl items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors',
                  !showNames && 'mx-auto'
                )}
              >
                {showNames
                  ? (isRTL ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />)
                  : (isRTL ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />)
                }
              </button>
            </div>
            <div className="md:hidden px-2.5 py-2 overflow-x-auto">
              {loading ? (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? '...' : '...'}
                </div>
              ) : patients.length === 0 ? (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا يوجد مرضى' : 'Aucun patient'}
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-max">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      title={language === 'ar' ? patient.name_ar : patient.name_fr}
                      className={cn(
                        'rounded-2xl border border-transparent transition-all duration-200',
                        showNames ? 'px-2.5 py-1.5 flex items-center gap-2' : 'p-1.5',
                        selectedPatient?.id === patient.id
                          ? 'bg-primary/10 border-primary/25'
                          : 'hover:bg-muted/70 hover:border-border/60'
                      )}
                    >
                      <Avatar className={cn('w-9 h-9', selectedPatient?.id === patient.id && 'ring-2 ring-primary/50')}>
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {showNames && (
                        <span className="text-xs font-medium text-foreground whitespace-nowrap max-w-[140px] truncate">
                          {language === 'ar' ? patient.name_ar : patient.name_fr}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ScrollArea className="hidden md:block flex-1">
              <div className={cn('p-2 space-y-1.5', !showNames && 'flex flex-col items-center')}>
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {language === 'ar' ? '...' : '...'}
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {language === 'ar' ? 'لا يوجد مرضى' : 'Aucun patient'}
                  </div>
                ) : (
                  patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      title={showNames ? undefined : (language === 'ar' ? patient.name_ar : patient.name_fr)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl transition-all duration-200 border border-transparent interactive-lift',
                        showNames ? 'w-full p-3 text-left' : 'p-1.5 justify-center',
                        selectedPatient?.id === patient.id
                          ? 'bg-primary/10 border-primary/25 shadow-[0_10px_18px_-14px_hsl(var(--primary)/0.85)]'
                          : 'hover:bg-muted/70 hover:border-border/60'
                      )}
                    >
                      <Avatar className={cn(selectedPatient?.id === patient.id ? 'ring-2 ring-primary/50' : '', showNames ? 'w-10 h-10' : 'w-9 h-9')}>
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {showNames && (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {language === 'ar' ? patient.name_ar : patient.name_fr}
                            </p>
                          </div>
                          <StatusBadge status={patient.status} />
                        </>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="card-shadow flex flex-col overflow-hidden rounded-3xl border-border/70 medical-illustration-soft">
            {selectedPatient ? (
              <>
                {/* Messages - Only scrollable area */}
                <ScrollArea className="flex-1">
                  <div className="p-6 md:p-7 space-y-6">
                    {messages.map((msg, idx) => {
                      const isDoctor = msg.sender === 'doctor';
                      const showAvatar = !isDoctor && (idx === 0 || messages[idx - 1].sender === 'doctor');
                      return (
                        <div
                          key={`${msg.id}-${idx}`}
                          className={cn(
                            'flex gap-3 items-end transition-all duration-300 hover:translate-y-[-1px]',
                            isDoctor ? 'flex-row-reverse' : 'flex-row'
                          )}
                        >
                          {!isDoctor && (
                            <div className="w-8 flex-shrink-0">
                              {showAvatar ? (
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                                    {(language === 'ar' ? selectedPatient.name_ar : selectedPatient.name_fr).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : <div className="w-8" />}
                            </div>
                          )}
                          <div
                            className={cn(
                              'max-w-[72%] rounded-3xl px-5 py-3.5 shadow-sm relative border transition-all duration-200',
                              isDoctor
                                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md border-primary/30 shadow-[0_14px_24px_-18px_hsl(var(--primary)/0.95)]'
                                : 'bg-card border-border/75 text-foreground rounded-bl-md'
                            )}
                          >
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                            <div className={cn(
                              'flex items-center gap-1 mt-1 text-[10px]',
                              isDoctor ? 'text-primary-foreground/80 justify-end' : 'text-muted-foreground justify-start'
                            )}>
                              <span>{formatTime(msg.timestamp)}</span>
                              {isDoctor && <span className="ml-1">{getStatusIcon(msg.status)}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border/70 flex-shrink-0 bg-card/85 backdrop-blur-lg">
                  <div className="flex items-end gap-2 bg-background/80 p-2 rounded-[20px] border border-border/65 focus-within:ring-2 focus-within:ring-primary/25 transition-all">
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0 transition-colors',
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
                    <Textarea
                      placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Écrivez votre message...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[44px] max-h-[100px] resize-none bg-transparent border-none shadow-none focus-visible:ring-0 py-2.5 px-1"
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="flex-shrink-0 h-10 w-10 rounded-full"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                <p>{language === 'ar' ? 'اختر مريضاً للبدء' : 'Sélectionnez un patient pour commencer'}</p>
              </div>
            )}
          </Card>
        </div>
    </DashboardLayout>
  );
};

export default DoctorChatPage;
