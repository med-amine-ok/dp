import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import DialysisTypeBadge from '@/components/DialysisTypeBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Users, Search, Eye, Pencil, Ban, Stethoscope, Mail, Phone, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  dialysis_type: 'HD' | 'PD';
  status: 'active' | 'recovering' | 'critical';
  assigned_doctor_id?: string;
  registration_date: string;
  created_at: string;
}

interface Doctor {
  id: string;
  name_ar: string;
  name_fr: string;
  specialization: string;
  patientCount?: number;
}

const UserManagementPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
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

      const doctorsWithCounts = await Promise.all(
        (doctorsData || []).map(async (doctor) => {
          // Patient count
          const { count: patientCount } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_doctor_id', doctor.id);

          return {
            ...doctor,
            patientCount: patientCount || 0,
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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name_fr.toLowerCase().includes(searchLower) ||
      patient.name_ar.includes(searchQuery)
    );
  });

  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doctor.name_fr.toLowerCase().includes(searchLower) ||
      doctor.name_ar.includes(searchQuery) ||
      doctor.specialization.toLowerCase().includes(searchLower)
    );
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
        <div className="flex items-center justify-between">
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
          <Button onClick={fetchData} variant="outline" size="icon" className="rounded-full">
            <RefreshCw className="h-4 w-4" />
          </Button>
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
                placeholder={language === 'ar' ? 'بحث عن اسم أو تخصص...' : 'Rechercher un nom ou spécialité...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('rounded-full transition-all focus:ring-primary', isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 p-1 bg-muted rounded-xl">
            <TabsTrigger value="patients" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              {language === 'ar' ? 'المرضى' : 'Patients'}
              <Badge variant="secondary" className="ml-1">{patients.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <Stethoscope className="h-4 w-4" />
              {language === 'ar' ? 'الأطباء' : 'Médecins'}
              <Badge variant="secondary" className="ml-1">{doctors.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Patients Table */}
          <TabsContent value="patients">
            <Card className="card-shadow overflow-hidden border-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[250px]">{t('admin.name')}</TableHead>
                      <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                      <TableHead>{t('admin.assignedDoctor')}</TableHead>
                      <TableHead>{t('admin.registrationDate')}</TableHead>
                      <TableHead>{t('admin.status')}</TableHead>
                      <TableHead className="text-center">{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          {language === 'ar' ? 'لا يوجد مرضى مطابقين للبحث' : 'Aucun patient trouvé'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => {
                        const doctor = doctors.find(d => d.id === patient.assigned_doctor_id);
                        return (
                          <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center font-bold text-secondary-foreground border border-secondary">
                                  {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {language === 'ar' ? patient.name_ar : patient.name_fr}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {patient.age} {language === 'ar' ? 'سنة' : 'ans'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DialysisTypeBadge type={patient.dialysis_type} />
                            </TableCell>
                            <TableCell>
                              {doctor ? (
                                <div className="flex items-center gap-2">
                                  <Stethoscope className="h-3 w-3 text-primary" />
                                  <span className="text-sm font-medium">{language === 'ar' ? doctor.name_ar : doctor.name_fr}</span>
                                </div>
                              ) : <span className="text-muted-foreground text-xs italic">Non assigné</span>}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(patient.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={patient.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10" title={t('admin.view')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-accent hover:bg-accent/10" title={t('admin.edit')}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" title={t('admin.deactivate')}>
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
            <Card className="card-shadow overflow-hidden border-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px]">{t('admin.name')}</TableHead>
                      <TableHead>{t('admin.specialization')}</TableHead>
                      <TableHead>{t('admin.patientCount')}</TableHead>
                      <TableHead className="text-center">{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          {language === 'ar' ? 'لا يوجد أطباء مطابقين للبحث' : 'Aucun médecin trouvé'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {language === 'ar' ? doctor.name_ar : doctor.name_fr}
                                </p>
                                <div className="flex gap-2">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal text-muted-foreground">
                              {doctor.specialization}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-bold text-lg">{doctor.patientCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10" title={t('admin.view')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-accent hover:bg-accent/10" title={t('admin.edit')}>
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
