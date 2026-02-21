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
import { Users, Search, Pencil, Ban, Stethoscope, Mail, Phone, RefreshCw, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  dialysis_type: 'HD' | 'PD';
  status: 'active' | 'recovering' | 'critical';
  assigned_doctor_id?: string;
  registration_date?: string;
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

  // Dialog State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

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
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (user: any, action: 'edit' | 'delete', type: 'patient' | 'doctor') => {
    const name = language === 'ar' ? user.name_ar : user.name_fr;

    if (action === 'delete') {
      const confirmMsg = language === 'ar'
        ? `هل أنت متأكد من حذف ${name}؟ لا يمكن التراجع عن هذا الإجراء.`
        : `Êtes-vous sûr de vouloir supprimer ${name} ? Cette action est irréversible.`;

      if (window.confirm(confirmMsg)) {
        performDelete(user.id, type);
      }
      return;
    }

    setSelectedUser(user);
    setUserType(type);
    setFormData({ ...user });
    setIsDialogOpen(true);
  };

  const performDelete = async (id: string, type: 'patient' | 'doctor') => {
    const table = type === 'patient' ? 'patients' : 'doctors';
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Supprimé avec succès');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Échec de la suppression');
    }
  };

  const handleSave = async () => {
    if (!formData || !userType) return;

    const table = userType === 'patient' ? 'patients' : 'doctors';
    try {
      const dataToUpdate = { ...formData };
      delete dataToUpdate.patientCount;
      delete dataToUpdate.created_at;

      const { error } = await supabase
        .from(table)
        .update(dataToUpdate)
        .eq('id', formData.id);

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Modifications enregistrées avec succès');
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de l\'enregistrement');
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (patient.name_fr?.toLowerCase() || '').includes(searchLower) ||
      (patient.name_ar || '').includes(searchQuery)
    );
  });

  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (doctor.name_fr?.toLowerCase() || '').includes(searchLower) ||
      (doctor.name_ar || '').includes(searchQuery) ||
      (doctor.specialization?.toLowerCase() || '').includes(searchLower)
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
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('nav.userManagement')}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'إدارة المرضى والأطباء وبياناتهم' : 'Gérer les données des patients et des médecins'}
              </p>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline" size="icon" className="rounded-full">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <Card className="card-shadow border-none">
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
                className={cn('rounded-xl transition-all border-muted focus:ring-primary', isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full max-md:max-w-full max-w-md grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="patients" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background transition-all">
              <Users className="h-4 w-4" />
              {language === 'ar' ? 'المرضى' : 'Patients'}
              <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-none">{patients.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background transition-all">
              <Stethoscope className="h-4 w-4" />
              {language === 'ar' ? 'الأطباء' : 'Médecins'}
              <Badge variant="secondary" className="ml-1 bg-accent/10 text-accent border-none">{doctors.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Patients Table */}
          <TabsContent value="patients">
            <Card className="card-shadow overflow-hidden border-none rounded-xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-[250px] font-bold">{t('admin.name')}</TableHead>
                      <TableHead className="font-bold">{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                      <TableHead className="font-bold">{t('admin.assignedDoctor')}</TableHead>
                      <TableHead className="font-bold">{t('admin.registrationDate')}</TableHead>
                      <TableHead className="font-bold">{t('admin.status')}</TableHead>
                      <TableHead className="text-center font-bold">{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                          <Users className="h-16 w-16 mx-auto mb-4 opacity-10" />
                          {language === 'ar' ? 'لا يوجد مرضى مطابقين للبحث' : 'Aucun patient trouvé'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => {
                        const doctor = doctors.find(d => d.id === patient.assigned_doctor_id);
                        return (
                          <TableRow key={patient.id} className="hover:bg-muted/10 transition-colors border-muted/20">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                               
                                <div>
                                  <p className="font-bold text-foreground">
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
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 w-fit">
                                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs font-semibold">{language === 'ar' ? doctor.name_ar : doctor.name_fr}</span>
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-accent hover:bg-accent/10 rounded-lg"
                                  title={t('admin.edit')}
                                  onClick={() => handleAction(patient, 'edit', 'patient')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg"
                                  title={t('admin.deactivate')}
                                  onClick={() => handleAction(patient, 'delete', 'patient')}
                                >
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
            <Card className="card-shadow overflow-hidden border-none rounded-xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-[300px] font-bold">{t('admin.name')}</TableHead>
                      <TableHead className="font-bold">{t('admin.specialization')}</TableHead>
                      <TableHead className="font-bold">{t('admin.patientCount')}</TableHead>
                      <TableHead className="text-center font-bold">{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                          <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-10" />
                          {language === 'ar' ? 'لا يوجد أطباء مطابقين للبحث' : 'Aucun médecin trouvé'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id} className="hover:bg-muted/10 transition-colors border-muted/20">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-bold text-foreground">
                                  {language === 'ar' ? doctor.name_ar : doctor.name_fr}
                                </p>
                                <div className="flex gap-2">
                                  <Mail className="h-3 w-3 text-muted-foreground opacity-50" />
                                  <Phone className="h-3 w-3 text-muted-foreground opacity-50" />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium bg-background text-muted-foreground border-muted rounded-lg px-3">
                              {doctor.specialization}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-black text-lg">{doctor.patientCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-accent hover:bg-accent/10 rounded-lg"
                                title={t('admin.edit')}
                                onClick={() => handleAction(doctor, 'edit', 'doctor')}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg"
                                title={t('admin.deactivate')}
                                onClick={() => handleAction(doctor, 'delete', 'doctor')}
                              >
                                <Ban className="h-4 w-4" />
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

        {/* Dialog for Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-none card-shadow">
            <div className={cn(
              "h-24 flex items-end p-6",
              userType === 'patient' ? "bg-primary/20" : "bg-accent/20"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl card-shadow bg-background",
                  userType === 'patient' ? "text-primary" : "text-accent"
                )}>
                  {userType === 'patient' ? '👶' : '👨‍⚕️'}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">
                    {language === 'ar' ? 'تعديل البيانات' : 'Modifier les données'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium">
                    {language === 'ar'
                      ? (userType === 'patient' ? 'ملف المريض' : 'ملف الطبيب')
                      : (userType === 'patient' ? 'Profil Patient' : 'Profil Médecin')
                    }
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {language === 'ar' ? 'الاسم (بالفرنسية)' : 'Nom (Français)'}
                  </Label>
                  <Input
                    value={formData?.name_fr || ''}
                    onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                    className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-semibold"
                  />
                </div>
                <div className="space-y-2" dir="rtl">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-full block text-right">
                    {language === 'ar' ? 'الاسم (بالعربية)' : 'Nom (Arabe)'}
                  </Label>
                  <Input
                    value={formData?.name_ar || ''}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-bold text-right"
                  />
                </div>

                {userType === 'patient' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {language === 'ar' ? 'العمر' : 'Âge'}
                      </Label>
                      <Input
                        type="number"
                        value={formData?.age || ''}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                        className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {language === 'ar' ? 'نوع الغسيل' : 'Type de dialyse'}
                      </Label>
                      <Select
                        value={formData?.dialysis_type}
                        onValueChange={(val: any) => setFormData({ ...formData, dialysis_type: val })}
                      >
                        <SelectTrigger className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="HD">Hémodialyse (HD)</SelectItem>
                          <SelectItem value="PD">Dialyse péritonéale (PD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {language === 'ar' ? 'الحالة' : 'Statut'}
                      </Label>
                      <Select
                        value={formData?.status}
                        onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                      >
                        <SelectTrigger className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="active">{language === 'ar' ? 'نشط' : 'Actif'}</SelectItem>
                          <SelectItem value="recovering">{language === 'ar' ? 'تعافي' : 'Récupération'}</SelectItem>
                          <SelectItem value="critical">{language === 'ar' ? 'حرج' : 'Critique'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {language === 'ar' ? 'الطبيب المعين' : 'Médecin assigné'}
                      </Label>
                      <Select
                        value={formData?.assigned_doctor_id || "none"}
                        onValueChange={(val) => setFormData({ ...formData, assigned_doctor_id: val === "none" ? null : val })}
                      >
                        <SelectTrigger className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">{language === 'ar' ? 'لا يوجد' : 'Aucun'}</SelectItem>
                          {doctors.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {language === 'ar' ? doc.name_ar : doc.name_fr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userType === 'doctor' && (
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {language === 'ar' ? 'التخصص' : 'Spécialisation'}
                    </Label>
                    <Input
                      value={formData?.specialization || ''}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="rounded-xl border-muted bg-muted/20 focus:ring-primary h-12 font-semibold"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-6 bg-muted/30 border-t border-muted/20 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl h-12 px-8 font-bold border-muted"
              >
                <X className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl h-12 px-8 font-extrabold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'حفظ' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagementPage;
