import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, MessageCircle, Check, CheckCheck, Flag, FileText, Clock } from 'lucide-react';
import { mockPatients, mockChatMessages } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const DoctorChatPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [messages, setMessages] = useState<Message[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');

  const messageTemplates = [
    { labelFr: 'Comment te sens-tu aujourd\'hui ?', labelAr: 'كيف تشعر اليوم؟' },
    { labelFr: 'N\'oublie pas de boire de l\'eau', labelAr: 'لا تنسى شرب الماء' },
    { labelFr: 'Ta prochaine séance est prévue', labelAr: 'جلستك القادمة مقررة' },
    { labelFr: 'Très bien, continue comme ça !', labelAr: 'جيد جداً، استمر هكذا!' },
  ];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'doctor',
      message: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
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
      <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)]">
        <div className="grid md:grid-cols-3 gap-4 h-full">
          {/* Patients List */}
          <Card className="card-shadow">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {language === 'ar' ? 'المحادثات' : 'Conversations'}
              </h2>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-2 space-y-1">
                {mockPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      selectedPatient.id === patient.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {(language === 'ar' ? patient.name : patient.nameFr).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {language === 'ar' ? patient.name : patient.nameFr}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {patient.age} {language === 'ar' ? 'سنة' : 'ans'}
                      </p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 card-shadow flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {(language === 'ar' ? selectedPatient.name : selectedPatient.nameFr).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {language === 'ar' ? selectedPatient.name : selectedPatient.nameFr}
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
            <div className="p-3 bg-muted/50 border-b border-border flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'آخر جلسة:' : 'Dernière séance:'} {selectedPatient.lastSession}
                </span>
              </div>
              <StatusBadge status={selectedPatient.status} />
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.sender === 'doctor' && (isRTL ? 'flex-row-reverse' : 'flex-row'),
                      msg.sender === 'patient' && (isRTL ? 'flex-row' : 'flex-row-reverse')
                    )}
                  >
                    {msg.sender === 'patient' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {(language === 'ar' ? selectedPatient.name : selectedPatient.nameFr).charAt(0)}
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
                ))}
              </div>
            </ScrollArea>

            {/* Templates */}
            <div className="p-3 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {messageTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => handleTemplate(template)}
                  >
                    {language === 'ar' ? template.labelAr : template.labelFr}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
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
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorChatPage;
