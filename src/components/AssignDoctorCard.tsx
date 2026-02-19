import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SelectDoctorDialog from './SelectDoctorDialog';

interface Doctor {
  id: string;
  name_ar: string;
  name_fr: string;
  avatar_url: string;
  specialization?: string;
  bio_ar?: string;
  bio_fr?: string;
}

const AssignDoctorCard: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [assignedDoctor, setAssignedDoctor] = useState<Doctor | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  // Fetch patient data and assigned doctor
  useEffect(() => {
    if (!user) return;

    const fetchPatientAndDoctor = async () => {
      try {
        setLoading(true);

        // Get patient ID and assigned doctor ID
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('id, assigned_doctor_id')
          .eq('user_id', user.id)
          .single();

        if (patientError) throw patientError;

        if (patientData) {
          setPatientId(patientData.id);

          // If patient has assigned doctor, fetch doctor details
          if (patientData.assigned_doctor_id) {
            // Try fetching from doctors table first
            let { data: doctorData, error: doctorError } = await supabase
              .from('doctors')
              .select('*')
              .eq('id', patientData.assigned_doctor_id)
              .single();

            console.log('Doctor from doctors table:', { doctorData, doctorError });

            // If not found in doctors table, try profiles table
            if (!doctorData && doctorError) {
              const { data: profileDoctor, error: profileError } = await supabase
                .from('profiles')
                .select('id, name_ar, name_fr, avatar_url, user_id')
                .eq('user_id', patientData.assigned_doctor_id)
                .single();

              console.log('Doctor from profiles table:', { profileDoctor, profileError });

              if (profileError) throw profileError;
              if (profileDoctor) {
                setAssignedDoctor({
                  id: profileDoctor.user_id || profileDoctor.id,
                  name_ar: profileDoctor.name_ar || '',
                  name_fr: profileDoctor.name_fr || '',
                  avatar_url: profileDoctor.avatar_url || '', // Google avatar from profiles
                  specialization: '',
                  bio_ar: '',
                  bio_fr: '',
                });
              }
            } else {
              if (doctorError) throw doctorError;
              if (doctorData) {
                setAssignedDoctor(doctorData);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patient and doctor info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAndDoctor();
  }, [user]);

  const handleDoctorSelected = async (doctor: Doctor) => {
    if (!patientId) return;

    try {
      // Update patient's assigned_doctor_id in database
      const { error } = await supabase
        .from('patients')
        .update({ assigned_doctor_id: doctor.id })
        .eq('id', patientId);

      if (error) throw error;

      setAssignedDoctor(doctor);
      setShowDialog(false);
    } catch (error) {
      console.error('Error assigning doctor:', error);
    }
  };

  const doctorName = assignedDoctor
    ? language === 'ar'
      ? assignedDoctor.name_ar
      : assignedDoctor.name_fr
    : '';

  const docBio = assignedDoctor
    ? language === 'ar'
      ? assignedDoctor.bio_ar
      : assignedDoctor.bio_fr
    : '';

  return (
    <>
      {assignedDoctor ? (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'طبيبك' : 'Ton médecin'}
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-700 border-green-300">
                <Check className="w-3 h-3 mr-1" />
                {language === 'ar' ? 'معين' : 'Assigné'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                {assignedDoctor.avatar_url ? (
                  <img src={assignedDoctor.avatar_url} alt={doctorName} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback>{doctorName.charAt(0) || 'D'}</AvatarFallback>
                )}
              </Avatar>
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-bold text-lg text-foreground">{doctorName}</h3>
                {assignedDoctor.specialization && (
                  <p className="text-sm text-muted-foreground">{assignedDoctor.specialization}</p>
                )}
                {docBio && <p className="text-sm text-muted-foreground mt-1">{docBio}</p>}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDialog(true)}
              className="w-full"
            >
              {language === 'ar' ? 'تغيير الطبيب' : 'Changer de médecin'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'من هو طبيبك؟' : 'Qui est ton médecin ?'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              {language === 'ar'
                ? 'لم يتم تعيين طبيب لك بعد. اختر طبيبك لتتمكن من التواصل معه والقيام بالجلسات.'
                : 'Aucun médecin assigné. Choisissez votre médecin pour communiquer et gérer vos séances.'}
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'اختر طبيبك' : 'Sélectionne ton médecin'}
            </Button>
          </CardContent>
        </Card>
      )}

      <SelectDoctorDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onDoctorSelected={handleDoctorSelected}
      />
    </>
  );
};

export default AssignDoctorCard;
