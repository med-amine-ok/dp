import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, MessageCircle, Check, CheckCheck, Smile } from 'lucide-react';
import { mockChatMessages } from '@/data/mockData';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const PatientChatPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');

  const quickResponses = [
    { labelFr: 'Comment allez-vous ?', labelAr: 'كيف حالك؟' },
    { labelFr: 'J\'ai une question', labelAr: 'لدي سؤال' },
    { labelFr: 'Merci docteur !', labelAr: 'شكراً دكتور!' },
    { labelFr: 'Je me sens bien', labelAr: 'أشعر بتحسن' },
  ];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      message: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleQuickResponse = (response: { labelFr: string; labelAr: string }) => {
    const messageText = language === 'ar' ? response.labelAr : response.labelFr;
    const message: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      message: messageText,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    setMessages([...messages, message]);
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
      <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {t('chat.title')}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Dr. Karim {language === 'ar' ? '- متصل' : '- En ligne'}
              </span>
            </div>
          </div>
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              DK
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Chat Area */}
        <Card className="h-[calc(100%-8rem)] card-shadow flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.sender === 'patient' && (isRTL ? 'flex-row-reverse' : 'flex-row'),
                    msg.sender === 'doctor' && (isRTL ? 'flex-row' : 'flex-row-reverse')
                  )}
                >
                  {msg.sender === 'doctor' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        DK
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-3 animate-slide-up',
                      msg.sender === 'patient'
                        ? 'bg-chat-user text-chat-user-foreground'
                        : 'bg-chat-doctor text-chat-doctor-foreground'
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      msg.sender === 'patient' ? 'justify-end' : 'justify-start'
                    )}>
                      <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                      {msg.sender === 'patient' && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Responses */}
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">{t('chat.quickResponses')}</p>
            <div className="flex flex-wrap gap-2">
              {quickResponses.map((response, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => handleQuickResponse(response)}
                >
                  {language === 'ar' ? response.labelAr : response.labelFr}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Input
                placeholder={t('chat.placeholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-full"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="flex-shrink-0 rounded-full"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientChatPage;
