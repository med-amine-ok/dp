import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, MessageCircle, Check, CheckCheck, Flag, FileText, Clock } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
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
        setMessages(mapped);
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
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto h-[calc(100vh-7rem)] overflow-hidden">
        <div className="grid md:grid-cols-3 gap-4 h-full overflow-hidden">
          {/* Patients List */}
          <Card className="card-shadow overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex-shrink-0">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {language === 'ar' ? 'المحادثات' : 'Conversations'}
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {language === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
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
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                        selectedPatient?.id === patient.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {language === 'ar' ? patient.name_ar : patient.name_fr}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {patient.age} {language === 'ar' ? 'سنة' : 'ans'}
                        </p>
                      </div>
                      <StatusBadge status={patient.status} />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2  card-shadow flex flex-col overflow-hidden">
            {selectedPatient ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {(language === 'ar' ? selectedPatient.name_ar : selectedPatient.name_fr).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {language === 'ar' ? selectedPatient.name_ar : selectedPatient.name_fr}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        {language === 'ar' ? 'متصل' : 'En ligne'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title={language === 'ar' ? 'عاجل' : 'Urgent'}>
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={language === 'ar' ? 'الملف الطبي' : 'Dossier médical'}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Patient Quick Info */}
                <div className="p-3 bg-muted/50 border-b border-border flex items-center gap-4 text-sm flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'آخر جلسة:' : 'Dernière séance:'} {selectedPatient.last_session || '-'}
                    </span>
                  </div>
                  <StatusBadge status={selectedPatient.status} />
                </div>

                {/* Messages - Only scrollable area */}
                <ScrollArea className="flex-1 overflow-hidden">
                  <div className="p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={`${msg.id}-${idx}`}
                        className={cn(
                          'flex gap-3',
                          msg.sender === 'doctor' && (isRTL ? 'flex-row-reverse' : 'flex-row-reverse'),
                          msg.sender === 'patient' && (isRTL ? 'flex-row' : 'flex-row')
                        )}
                      // Note: Fixed alignment logic. Doctor (me) should always be on "End" (Right in LTR, Left in RTL usually, or just Right for 'me')
                      // Let's simplify: Me (doctor) -> Right. Them (Patient) -> Left.
                      // Tailwind 'flex-row-reverse' puts items in reverse order.
                      // Actually better to just use justification.
                      >
                        <div className={cn(
                          'flex gap-3 w-full',
                          msg.sender === 'doctor' ? 'justify-end' : 'justify-start'
                        )}>
                          {msg.sender === 'patient' && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {(language === 'ar' ? selectedPatient.name_ar : selectedPatient.name_fr).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={cn(
                              'max-w-[75%] rounded-2xl px-4 py-3',
                              msg.sender === 'doctor'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            )}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className={cn(
                              'flex items-center gap-1 mt-1',
                              msg.sender === 'doctor' ? 'justify-end' : 'justify-start'
                            )}>
                              <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                              {msg.sender === 'doctor' && getStatusIcon(msg.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border flex-shrink-0">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Écrivez votre message...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[50px] max-h-[100px] resize-none"
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="flex-shrink-0 h-12 w-12"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
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
      </div>
    </DashboardLayout>
  );
};

export default DoctorChatPage;
