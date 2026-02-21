import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { Search, Filter, Users, Eye, MessageCircle, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  dialysis_type: 'HD' | 'PD';
  status: 'active' | 'recovering' | 'critical';
  last_session?: string;
  assigned_doctor_id?: string;
}

const PatientsPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        // 1. Get Doctor ID
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorError) {
          console.error('Error fetching doctor profile:', doctorError);
          setLoading(false);
          return;
        }

        // 2. Fetch Patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('assigned_doctor_id', doctorData.id);

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter(patient => {
    const nameMatch = (patient.name_fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.name_ar || '').includes(searchQuery);
    const statusMatch = statusFilter === 'all' || patient.status === statusFilter;
    const typeMatch = typeFilter === 'all' || patient.dialysis_type === typeFilter;
    return nameMatch && statusMatch && typeMatch;
  });

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('doctor.patients')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? `${filteredPatients.length} مريض`
                : `${filteredPatients.length} patients`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className={cn(
                  'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
                  isRTL ? 'right-3' : 'left-3'
                )} />
                <Input
                  placeholder={t('doctor.searchPatients')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn('rounded-full', isRTL ? 'pr-10' : 'pl-10')}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('doctor.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('doctor.allStatus')}</SelectItem>
                  <SelectItem value="active">{t('doctor.active')}</SelectItem>
                  <SelectItem value="recovering">{t('doctor.recovering')}</SelectItem>
                  <SelectItem value="critical">{t('doctor.critical')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-full">
                  <SelectValue placeholder={t('doctor.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('doctor.allTypes')}</SelectItem>
                  <SelectItem value="HD">HD - Hémodialyse</SelectItem>
                  <SelectItem value="PD">PD - Dialyse péritonéale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card className="card-shadow">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'المريض' : 'Patient'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Statut'}</TableHead>
                  
                  <TableHead className="text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          
                          <div>
                            <p className="font-medium text-foreground">
                              {language === 'ar' ? patient.name_ar : patient.name_fr}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={patient.status} />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title={t('doctor.viewDetails')}
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title={t('doctor.openChat')}
                            onClick={() => navigate('/doctor/chat')}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Chargement...') : (language === 'ar' ? 'لا يوجد مرضى' : 'Aucun patient trouvé')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientsPage;
