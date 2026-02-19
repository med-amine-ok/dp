import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { Users, Search, Eye, Pencil, Ban, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  status: 'active' | 'recovering' | 'critical';
  assigned_doctor_id?: string;
  created_at: string;
}

interface Doctor {
  id: string;
  name_ar: string;
  name_fr: string;
  specialization: string;
  patientCount?: number;
  activeSessions?: number;
}

const UserManagementPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (patientsError) throw patientsError;

        // Fetch Doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*');

        if (doctorsError) throw doctorsError;

        // Calculate counts for each doctor
        const today = new Date().toISOString().split('T')[0];
        const doctorsWithCounts = await Promise.all(
          (doctorsData || []).map(async (doctor) => {
            // Patient count
            const { count: patientCount } = await supabase
              .from('patients')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_doctor_id', doctor.id);

            // Active sessions today
            const { count: activeSessions } = await supabase
              .from('dialysis_sessions')
              .select('*', { count: 'exact', head: true })
              .eq('session_date', today)
              .in('status', ['scheduled', 'completed']);

            return {
              ...doctor,
              patientCount: patientCount || 0,
              activeSessions: activeSessions || 0,
            };
          })
        );

        setPatients(patientsData || []);
        setDoctors(doctorsWithCounts);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const nameMatch = patient.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.name_ar.includes(searchQuery);
    return nameMatch;
  });

  const filteredDoctors = doctors.filter(doctor => {
    const nameMatch = doctor.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.name_ar.includes(searchQuery);
    return nameMatch;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('nav.userManagement')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'إدارة المرضى والأطباء' : 'Gérer les patients et les médecins'}
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className={cn(
                'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                isRTL ? 'right-3' : 'left-3'
              )} />
              <Input
                placeholder={language === 'ar' ? 'بحث...' : 'Rechercher...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('rounded-full', isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === 'ar' ? 'المرضى' : 'Patients'} ({patients.length})
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              {language === 'ar' ? 'الأطباء' : 'Médecins'} ({doctors.length})
            </TabsTrigger>
          </TabsList>

          {/* Patients Table */}
          <TabsContent value="patients">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.patientsTable')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.name')}</TableHead>
                      
                      <TableHead>{t('admin.assignedDoctor')}</TableHead>
                      <TableHead>{t('admin.registrationDate')}</TableHead>
                      <TableHead>{t('admin.status')}</TableHead>
                      <TableHead className="text-center">{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {language === 'ar' ? 'لا يوجد مرضى' : 'Aucun patient trouvé'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => {
                        const doctor = doctors.find(d => d.id === patient.assigned_doctor_id);
                        return (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                  <span className="font-semibold text-secondary-foreground">
                                    {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                                  </span>
                                </div>
                                <span className="font-medium">
                                  {language === 'ar' ? patient.name_ar : patient.name_fr}
                                </span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              {doctor ? (language === 'ar' ? doctor.name_ar : doctor.name_fr) : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(patient.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR')}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={patient.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" title={t('admin.view')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title={t('admin.edit')}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title={t('admin.deactivate')}>
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Table */}
          <TabsContent value="doctors">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.doctorsTable')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.name')}</TableHead>
                      <TableHead>{t('admin.specialization')}</TableHead>
                      <TableHead>{t('admin.patientCount')}</TableHead>
                      <TableHead>{t('admin.activeSessions')}</TableHead>
                      <TableHead className="text-center">{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {language === 'ar' ? 'لا يوجد أطباء' : 'Aucun médecin trouvé'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-medium">
                                {language === 'ar' ? doctor.name_ar : doctor.name_fr}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{doctor.specialization}</TableCell>
                          <TableCell>
                            <span className="font-semibold">{doctor.patientCount}</span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-success/20 text-success rounded-full text-sm font-medium">
                              {doctor.activeSessions}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t('admin.view')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t('admin.edit')}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserManagementPage;
