import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, MessageCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import DialysisTypeBadge from '@/components/DialysisTypeBadge';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  dialysis_type: 'HD' | 'PD';
  status: 'active' | 'recovering' | 'critical';
  last_session?: string;
}

const DoctorDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Get Doctor ID using user.id
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (doctorError) {
          console.error('Error fetching doctor profile:', doctorError);
          setLoading(false);
          return;
        }

        let doctorId: string;

        // If no doctor found, try to create one
        if (!doctorData) {
          console.warn('No doctor record found, creating one...');
          const { data: newDoctor, error: createError } = await supabase
            .from('doctors')
            .insert({
              user_id: user.id,
              name_ar: user.name,
              name_fr: user.name,
              specialization: 'General Practitioner',
            })
            .select('id')
            .single();

          if (createError || !newDoctor) {
            console.error('Error creating doctor record:', createError);
            setLoading(false);
            return;
          }
          doctorId = newDoctor.id;
        } else {
          doctorId = doctorData.id;
        }

        // 2. Fetch Patients assigned to this doctor
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('assigned_doctor_id', doctorId);

        if (patientsError) throw patientsError;

        setPatients(patientsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const criticalPatients = patients.filter(p => p.status === 'critical');
  const activePatientsCount = patients.filter(p => p.status === 'active').length;
  const recoveringCount = patients.filter(p => p.status === 'recovering').length;

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('doctor.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? `مرحباً د. ${user?.name?.split(' ')[0] || ''}! إليك ملخص اليوم.`
              : `Bonjour Dr. ${user?.name?.split(' ')[0] || ''} ! Voici votre résumé du jour.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title={language === 'ar' ? 'المرضى' : 'Patients'}
            value={patients.length.toString()}
            subtitle={language === 'ar' ? 'إجمالي المرضى' : 'Total'}
            icon={Users}
            color="primary"
          />
          <DashboardCard
            title={language === 'ar' ? 'نشط' : 'Actifs'}
            value={activePatientsCount.toString()}
            subtitle={language === 'ar' ? 'مرضى نشطين' : 'Patients actifs'}
            icon={Activity}
            color="success"
          />
          <DashboardCard
            title={language === 'ar' ? 'رسائل' : 'Messages'}
            value="0"
            subtitle={language === 'ar' ? 'غير مقروءة' : 'Non lus'}
            icon={MessageCircle}
            color="warning"
          />
        </div>

        {/* Critical Alerts */}
        {criticalPatients.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5 card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {language === 'ar' ? 'تنبيهات عاجلة' : 'Alertes urgentes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                        <span className="font-bold text-destructive">
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {language === 'ar' ? patient.name_ar : patient.name_fr}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patients List */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {language === 'ar' ? 'المرضى المعيّنون' : 'Patients assignés'}
            </CardTitle>
            <Link to="/doctor/patients" className="text-sm text-primary hover:underline">
              {language === 'ar' ? 'عرض الكل' : 'Voir tout'}
            </Link>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                {language === 'ar' ? 'لا يوجد مرضى معيّنون بعد.' : 'Aucun patient assigné pour l\'instant.'}
              </p>
            ) : (
              <div className="space-y-4">
                {patients.slice(0, 6).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="font-semibold text-secondary-foreground">
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {language === 'ar' ? patient.name_ar : patient.name_fr}
                        </p>
                        <div className="flex items-center gap-2">
                          <DialysisTypeBadge type={patient.dialysis_type} />
                          <span className="text-xs text-muted-foreground">
                            {patient.age} {language === 'ar' ? 'سنة' : 'ans'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
