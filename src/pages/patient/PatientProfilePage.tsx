import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
    User,
    Calendar,
    Activity,
    Heart,
    CheckCircle2,
    AlertCircle,
    Clock,
    Droplets,
    Stethoscope,
    Save,
    RefreshCw,
} from 'lucide-react';

type DialysisType = 'HD' | 'PD';
type PatientStatus = 'active' | 'recovering' | 'critical';

interface PatientProfile {
    id: string;
    name_fr: string;
    name_ar: string;
    age: number;
    dialysis_type: DialysisType;
    status: PatientStatus;
}

const dialysisOptions: { value: DialysisType; labelFr: string; labelAr: string; icon: React.ReactNode; descFr: string; descAr: string; color: string }[] = [
    {
        value: 'HD',
        labelFr: 'Hémodialyse',
        labelAr: 'غسيل الكلى',
        icon: <Droplets className="w-6 h-6" />,
        descFr: 'Le sang est filtré à travers une machine',
        descAr: 'يُنقى الدم عبر جهاز خارجي',
        color: 'from-blue-500/20 to-cyan-400/20 border-blue-300',
    },
    {
        value: 'PD',
        labelFr: 'Dialyse Péritonéale',
        labelAr: 'الديال الصفاقي',
        icon: <Activity className="w-6 h-6" />,
        descFr: 'Filtration via la paroi abdominale',
        descAr: 'ترشيح عبر جدار البطن',
        color: 'from-emerald-500/20 to-teal-400/20 border-emerald-300',
    },
];

const statusOptions: { value: PatientStatus; labelFr: string; labelAr: string; icon: React.ReactNode; color: string; bg: string }[] = [
    {
        value: 'active',
        labelFr: 'Actif',
        labelAr: 'نشط',
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'text-emerald-600',
        bg: 'from-emerald-500/20 to-green-400/20 border-emerald-300',
    },
    {
        value: 'recovering',
        labelFr: 'En rétablissement',
        labelAr: 'في طور التعافي',
        icon: <Clock className="w-5 h-5" />,
        color: 'text-amber-600',
        bg: 'from-amber-500/20 to-yellow-400/20 border-amber-300',
    },
    {
        value: 'critical',
        labelFr: 'Critique',
        labelAr: 'حرج',
        icon: <AlertCircle className="w-5 h-5" />,
        color: 'text-rose-600',
        bg: 'from-rose-500/20 to-red-400/20 border-rose-300',
    },
];

const AGE_MIN = 1;
const AGE_MAX = 18;

const PatientProfilePage: React.FC = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const isAr = language === 'ar';

    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [age, setAge] = useState<number>(10);
    const [dialysisType, setDialysisType] = useState<DialysisType>('HD');
    const [status, setStatus] = useState<PatientStatus>('active');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [completionPct, setCompletionPct] = useState(0);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('patients')
                    .select('id, name_fr, name_ar, age, dialysis_type, status')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setProfile(data as PatientProfile);
                    setAge(data.age ?? 10);
                    setDialysisType(data.dialysis_type ?? 'HD');
                    setStatus(data.status ?? 'active');
                }
            } catch (err) {
                console.error('Failed to load patient profile', err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [user]);

    // Compute completion percentage
    useEffect(() => {
        let filled = 0;
        if (age && age >= AGE_MIN && age <= AGE_MAX) filled++;
        if (dialysisType) filled++;
        if (status) filled++;
        setCompletionPct(Math.round((filled / 3) * 100));
    }, [age, dialysisType, status]);

    const handleSave = async () => {
        if (!user || !profile) return;
        if (age < AGE_MIN || age > AGE_MAX) {
            toast.error(isAr ? `العمر يجب أن يكون بين ${AGE_MIN} و ${AGE_MAX}` : `L'âge doit être entre ${AGE_MIN} et ${AGE_MAX} ans`);
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('patients')
                .update({ age, dialysis_type: dialysisType, status })
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success(isAr ? '✅ تم حفظ ملفك الشخصي بنجاح!' : '✅ Profil mis à jour avec succès !');
            setProfile(prev => prev ? { ...prev, age, dialysis_type: dialysisType, status } : prev);
        } catch (err: any) {
            toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Une erreur est survenue lors de la sauvegarde');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const displayName = isAr ? (profile?.name_ar || user?.name) : (profile?.name_fr || user?.name);

    if (isLoading) {
        return (
            <DashboardLayout role="patient">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                        <p className="text-muted-foreground font-medium">
                            {isAr ? 'جارٍ التحميل…' : 'Chargement…'}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="patient">
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">

                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[hsl(213_56%_32%)] to-[hsl(200_70%_40%)] p-8 card-shadow">
                    {/* Decorative circles */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-white/80" />
                                )}
                            </div>
                            {/* Completion badge */}
                            <div className="absolute -bottom-2 -right-2 bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                                {completionPct}%
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1">
                            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                                {isAr ? 'ملفي الشخصي' : 'Mon Profil'}
                            </p>
                            <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">
                                {displayName || (isAr ? 'المريض' : 'Patient')}
                            </h1>
                            <p className="text-white/70 text-sm">{user?.email}</p>
                        </div>

                        {/* Completion ring */}
                        {/* <div className="shrink-0 flex flex-col items-center">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                                <circle
                                    cx="40" cy="40" r="34" fill="none"
                                    stroke="rgba(255,255,255,0.85)" strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 34}`}
                                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - completionPct / 100)}`}
                                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                />
                            </svg>
                            <span className="text-white font-bold text-sm mt-1">
                                {isAr ? 'مكتمل' : 'Complété'}
                            </span>
                        </div> */}
                    </div>

                    {/* Progress bar */}
                    <div className="relative z-10 mt-6">
                        <div className="flex justify-between text-white/60 text-xs mb-1">
                            <span>{isAr ? 'اكتمال الملف' : 'Complétion du profil'}</span>
                            <span>{completionPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-white transition-all duration-700"
                                style={{ width: `${completionPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Age Card ── */}
                <Card className="card-shadow border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-secondary to-accent pb-4">
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            {isAr ? 'العمر' : 'Âge'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-sm mb-6">
                            {isAr
                                ? 'أدخل عمرك بالسنوات (بين 1 و 18)'
                                : `Entrez votre âge en années (entre ${AGE_MIN} et ${AGE_MAX} ans)`}
                        </p>

                        {/* Age Slider + Input */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-muted-foreground text-sm w-8 text-center">{AGE_MIN}</span>
                                <input
                                    id="age-slider"
                                    type="range"
                                    min={AGE_MIN}
                                    max={AGE_MAX}
                                    value={age}
                                    onChange={e => setAge(Number(e.target.value))}
                                    className="flex-1 h-3 rounded-full cursor-pointer accent-primary"
                                />
                                <span className="text-muted-foreground text-sm w-8 text-center">{AGE_MAX}</span>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <input
                                        id="age-input"
                                        type="number"
                                        min={AGE_MIN}
                                        max={AGE_MAX}
                                        value={age}
                                        onChange={e => {
                                            const v = Number(e.target.value);
                                            if (!isNaN(v)) setAge(Math.min(AGE_MAX, Math.max(AGE_MIN, v)));
                                        }}
                                        className="w-28 h-16 text-center text-3xl font-extrabold rounded-2xl border-2 border-primary/20 focus:border-primary focus:outline-none bg-secondary/40 text-foreground transition-all"
                                    />
                                    <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                                        {isAr ? 'سنة' : 'ans'}
                                    </span>
                                </div>
                            </div>

                            {/* Visual age representation */}
                            <div className="flex justify-center gap-1.5 flex-wrap mt-2">
                                {Array.from({ length: AGE_MAX }).map((_, i) => (
                                    <button
                                        key={i}
                                        id={`age-dot-${i + 1}`}
                                        onClick={() => setAge(i + 1)}
                                        className={`w-7 h-7 rounded-full text-xs font-bold transition-all duration-200 ${i + 1 === age
                                                ? 'bg-primary text-white scale-110 shadow-md'
                                                : i + 1 < age
                                                    ? 'bg-primary/30 text-primary'
                                                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Dialysis Type Card ── */}
                <Card className="card-shadow border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-secondary to-accent pb-4">
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Stethoscope className="w-5 h-5 text-primary" />
                            </div>
                            {isAr ? 'نوع غسيل الكلى' : 'Type de dialyse'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-sm mb-6">
                            {isAr ? 'اختر نوع الغسيل الذي تتلقاه' : 'Choisissez le type de dialyse que vous recevez'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dialysisOptions.map(opt => {
                                const selected = dialysisType === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        id={`dialysis-${opt.value}`}
                                        onClick={() => setDialysisType(opt.value)}
                                        className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 bg-gradient-to-br ${opt.color} ${selected
                                                ? 'border-primary shadow-lg scale-[1.02]'
                                                : 'border-transparent hover:border-primary/40 hover:shadow-md hover:scale-[1.01]'
                                            }`}
                                    >
                                        {selected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                        <div className={`mb-3 p-3 rounded-xl inline-flex ${selected ? 'bg-primary/20 text-primary' : 'bg-white/60 text-foreground'}`}>
                                            {opt.icon}
                                        </div>
                                        <h3 className={`text-lg font-bold mb-1 ${selected ? 'text-primary' : 'text-foreground'}`}>
                                            {isAr ? opt.labelAr : opt.labelFr}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {isAr ? opt.descAr : opt.descFr}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Status Card ── */}
                <Card className="card-shadow border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-secondary to-accent pb-4">
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Heart className="w-5 h-5 text-primary" />
                            </div>
                            {isAr ? 'الحالة الصحية' : 'État de santé'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-sm mb-6">
                            {isAr ? 'ما هو وضعك الصحي الحالي؟' : 'Quel est votre état de santé actuel ?'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statusOptions.map(opt => {
                                const selected = status === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        id={`status-${opt.value}`}
                                        onClick={() => setStatus(opt.value)}
                                        className={`group relative p-5 rounded-2xl border-2 text-center transition-all duration-300 bg-gradient-to-br ${opt.bg} ${selected
                                                ? 'border-primary shadow-lg scale-[1.03]'
                                                : 'border-transparent hover:border-primary/40 hover:shadow-md hover:scale-[1.01]'
                                            }`}
                                    >
                                        {selected && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                        <div className={`mx-auto mb-2 p-3 rounded-xl inline-flex ${opt.color} ${selected ? 'bg-white/80' : 'bg-white/60'}`}>
                                            {opt.icon}
                                        </div>
                                        <h3 className={`font-bold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
                                            {isAr ? opt.labelAr : opt.labelFr}
                                        </h3>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Summary Preview ── */}
                <Card className="card-shadow border-0 bg-gradient-to-br from-secondary/60 to-accent/40">
                    <CardHeader>
                        <CardTitle className="text-primary text-base">
                            {isAr ? '📋 ملخص البيانات' : '📋 Récapitulatif'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                {
                                    icon: <Calendar className="w-4 h-4" />,
                                    label: isAr ? 'العمر' : 'Âge',
                                    value: `${age} ${isAr ? 'سنة' : 'ans'}`,
                                    ok: age >= AGE_MIN && age <= AGE_MAX,
                                },
                                {
                                    icon: <Droplets className="w-4 h-4" />,
                                    label: isAr ? 'نوع الغسيل' : 'Dialyse',
                                    value: isAr
                                        ? dialysisOptions.find(d => d.value === dialysisType)?.labelAr
                                        : dialysisOptions.find(d => d.value === dialysisType)?.labelFr,
                                    ok: !!dialysisType,
                                },
                                {
                                    icon: <Heart className="w-4 h-4" />,
                                    label: isAr ? 'الحالة' : 'Statut',
                                    value: isAr
                                        ? statusOptions.find(s => s.value === status)?.labelAr
                                        : statusOptions.find(s => s.value === status)?.labelFr,
                                    ok: !!status,
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/70 rounded-xl p-4 flex flex-col items-center text-center gap-2 shadow-sm"
                                >
                                    <div className={`p-2 rounded-lg ${item.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                                        {item.icon}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.label}</p>
                                    <p className="font-bold text-sm text-foreground">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Save Button ── */}
                <div className="flex justify-end pb-6">
                    <Button
                        id="save-profile-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-14 px-10 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 gap-3"
                    >
                        {isSaving ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                {isAr ? 'جارٍ الحفظ…' : 'Sauvegarde…'}
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                {isAr ? 'حفظ الملف الشخصي' : 'Enregistrer le profil'}
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default PatientProfilePage;
