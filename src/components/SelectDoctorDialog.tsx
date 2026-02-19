import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Doctor {
  id: string;
  name_ar: string;
  name_fr: string;
  avatar_url: string;
  specialization?: string;
  bio_ar?: string;
  bio_fr?: string;
}

interface SelectDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDoctorSelected: (doctor: Doctor) => void;
}

const SelectDoctorDialog: React.FC<SelectDoctorDialogProps> = ({
  open,
  onOpenChange,
  onDoctorSelected,
}) => {
  const { language, t, isRTL } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        
        // Try fetching from doctors table first
        let { data, error } = await supabase
          .from('doctors')
          .select('*')
          .limit(100);

        console.log('Doctors from doctors table:', { data, error });

        if (data && data.length > 0) {
          setDoctors(data);
        } else {
          // Fallback: Get doctors from user_roles + profiles (with Google avatars)
          console.log('No doctors in doctors table, fetching from profiles...');
          
          const { data: userRolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'doctor');

          if (rolesError) throw rolesError;

          if (userRolesData && userRolesData.length > 0) {
            const doctorUserIds = userRolesData.map((ur: any) => ur.user_id);
            
            const { data: profilesDoctors, error: profilesError } = await supabase
              .from('profiles')
              .select('id, name_ar, name_fr, avatar_url, user_id')
              .in('user_id', doctorUserIds)
              .order('name_fr', { ascending: true });

            console.log('Doctors from profiles:', { profilesDoctors, profilesError });

            if (profilesError) throw profilesError;
            
            const transformedDoctors = (profilesDoctors || []).map((profile: any) => ({
              id: profile.user_id || profile.id,
              name_ar: profile.name_ar || '',
              name_fr: profile.name_fr || '',
              avatar_url: profile.avatar_url || '', // This now includes Google avatars from auth
              specialization: '',
              bio_ar: '',
              bio_fr: '',
            }));
            setDoctors(transformedDoctors);
          } else {
            setDoctors([]);
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [open]);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleConfirm = () => {
    if (selectedDoctor) {
      onDoctorSelected(selectedDoctor);
      setSelectedDoctor(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'اختر طبيبك' : 'Sélectionne ton médecin'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? 'اختر الطبيب الذي تريد أن تتواصل معه'
              : 'Choisissez le médecin avec lequel vous souhaitez communiquer'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {language === 'ar'
                  ? 'لا توجد أطباء متاحة حالياً'
                  : 'Aucun médecin disponible'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {doctors.map((doctor) => {
                  const doctorName = language === 'ar' ? doctor.name_ar : doctor.name_fr;
                  const docBio =
                    language === 'ar' ? doctor.bio_ar : doctor.bio_fr;
                  const isSelected = selectedDoctor?.id === doctor.id;

                  return (
                    <Card
                      key={doctor.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'border-2 border-primary bg-primary/5'
                          : 'border border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border border-primary/20">
                            {doctor.avatar_url ? (
                              <img src={doctor.avatar_url} alt={doctorName} className="w-full h-full object-cover" />
                            ) : (
                              <AvatarFallback>{doctorName.charAt(0) || 'D'}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {doctorName}
                              </h3>
                              {isSelected && (
                                <Badge className="bg-primary text-white">
                                  {language === 'ar' ? 'مختار' : 'Sélectionné'}
                                </Badge>
                              )}
                            </div>
                            {doctor.specialization && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {doctor.specialization}
                              </p>
                            )}
                            {docBio && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {docBio}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedDoctor(null);
            }}
          >
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDoctor}
          >
            {language === 'ar' ? 'تأكيد' : 'Confirmer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDoctorDialog;
