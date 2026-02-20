import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Auth
    'auth.welcome': 'Bienvenue sur DP Kid',
    'auth.subtitle': 'Plateforme de soins de dialyse pédiatrique',
    'auth.loginWithGoogle': 'Connexion avec Google',
    'auth.selectRole': 'Choisissez votre rôle',
    'auth.patient': 'Patient / Parent',
    'auth.patientDesc': 'Accéder au tableau de bord patient',
    'auth.doctor': 'Médecin',
    'auth.doctorDesc': 'Accéder au tableau de bord médecin',
    'auth.admin': 'Administrateur',
    'auth.adminDesc': 'Gérer la plateforme',

    // Auth Features
    'auth.feature1.title': 'Suivi de santé',
    'auth.feature1.desc': 'Suivez vos signes vitaux et votre bien-être quotidiennement',
    'auth.feature2.title': 'Communication facile',
    'auth.feature2.desc': 'Restez en contact avec votre équipe médicale',
    'auth.feature3.title': 'Espace éducatif',
    'auth.feature3.desc': 'Apprenez en vous amusant avec nos jeux interactifs',

    // Navigation
    'nav.home': 'Accueil',
    'nav.education': 'Éducation',
    'nav.healthForm': 'Formulaire de santé',
    'nav.chat': 'Chat avec le médecin',
    'nav.games': 'Jeux',
    'nav.patients': 'Patients',
    'nav.analytics': 'Analytique',
    'nav.userManagement': 'Gestion des utilisateurs',
    'nav.statistics': 'Statistiques',
    'nav.monitoring': 'Surveillance',
    'nav.logout': 'Déconnexion',

    // Patient Dashboard
    'patient.welcome': 'Bonjour',
    'patient.howAreYou': 'Comment te sens-tu aujourd\'hui ?',
    'patient.education.title': 'Centre d\'éducation',
    'patient.education.videos': 'Vidéos éducatives',
    'patient.education.learn': 'Apprendre sur la dialyse',
    'patient.education.hygiene': 'Hygiène et soins',
    'patient.education.treatment': 'Processus de traitement',
    'patient.education.funFacts': 'Faits amusants',

    // Health Form
    'health.title': 'Formulaire de santé quotidien',
    'health.mood': 'Comment te sens-tu ?',
    'health.moodGreat': 'Super !',
    'health.moodGood': 'Bien',
    'health.moodOkay': 'Ça va',
    'health.moodNotGood': 'Pas bien',
    'health.moodBad': 'Mal',
    'health.sessionDate': 'Date de la séance',
    'health.sessionDetails': 'Détails de la séance',
    'health.duration': 'Durée de la séance',
    'health.infusedQuantity': 'Quantité infusée',
    'health.drainedQuantity': 'Quantité drainée',
    'health.painLevel': 'Niveau de douleur',
    'health.symptoms': 'Symptômes',
    'health.fatigue': 'Fatigue',
    'health.nausea': 'Nausée',
    'health.headache': 'Mal de tête',
    'health.dizziness': 'Vertiges',
    'health.notes': 'Notes pour le médecin',
    'health.submit': 'Envoyer',
    'health.submitted': 'Formulaire envoyé !',

    // Chat
    'chat.title': 'Chat avec le médecin',
    'chat.placeholder': 'Écris ton message...',
    'chat.send': 'Envoyer',
    'chat.quickResponses': 'Réponses rapides',
    'chat.howAreYou': 'Comment allez-vous ?',
    'chat.question': 'J\'ai une question',
    'chat.thankYou': 'Merci docteur !',

    // Games
    'games.title': 'Zone de jeux',
    'games.educational': 'Jeux éducatifs',
    'games.relaxation': 'Jeux de relaxation',
    'games.healthQuiz': 'Quiz santé',
    'games.healthQuizDesc': 'Apprends sur les reins et la dialyse',
    'games.bodyExplorer': 'Explorateur du corps',
    'games.bodyExplorerDesc': 'Découvre comment fonctionne ton corps',
    'games.medicineMatch': 'Association médicaments',
    'games.medicineMatchDesc': 'Associe les traitements aux symptômes',
    'games.memoryMatch': 'Jeu de mémoire',
    'games.memoryMatchDesc': 'Retourne les cartes pour trouver les paires',
    'games.puzzleGarden': 'Jardin puzzle',
    'games.puzzleGardenDesc': 'Puzzles relaxants',
    'games.coloringCorner': 'Coin coloriage',
    'games.coloringCornerDesc': 'Colorie de belles images',
    'games.breathingBuddy': 'Ami respiration',
    'games.breathingBuddyDesc': 'Exercices de relaxation guidés',
    'games.play': 'Jouer',
    'games.minutes': 'min',
    'games.easy': 'Facile',
    'games.medium': 'Moyen',
    'games.hard': 'Difficile',

    // Doctor Dashboard
    'doctor.welcome': 'Tableau de bord médecin',
    'doctor.patients': 'Mes patients',
    'doctor.searchPatients': 'Rechercher des patients...',
    'doctor.filter': 'Filtrer',
    'doctor.allStatus': 'Tous les statuts',
    'doctor.active': 'Actif',
    'doctor.recovering': 'En récupération',
    'doctor.critical': 'Critique',
    'doctor.dialysisType': 'Type de dialyse',
    'doctor.allTypes': 'Tous les types',
    'doctor.lastSession': 'Dernière séance',
    'doctor.viewDetails': 'Voir détails',
    'doctor.openChat': 'Ouvrir chat',
    'doctor.schedule': 'Planifier séance',

    // Admin Dashboard
    'admin.welcome': 'Tableau de bord administrateur',
    'admin.totalPatients': 'Total patients',
    'admin.totalDoctors': 'Total médecins',
    'admin.activeSessions': 'Séances actives',
    'admin.satisfaction': 'Satisfaction',
    'admin.patientsTable': 'Gestion des patients',
    'admin.doctorsTable': 'Gestion des médecins',
    'admin.name': 'Nom',
    'admin.age': 'Âge',
    'admin.assignedDoctor': 'Médecin assigné',
    'admin.registrationDate': 'Date d\'inscription',
    'admin.status': 'Statut',
    'admin.actions': 'Actions',
    'admin.specialization': 'Spécialisation',
    'admin.patientCount': 'Nb patients',
    'admin.view': 'Voir',
    'admin.edit': 'Modifier',
    'admin.deactivate': 'Désactiver',

    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.years': 'ans',
    'common.today': 'Aujourd\'hui',
    'common.yesterday': 'Hier',
    'common.thisWeek': 'Cette semaine',
    'common.thisMonth': 'Ce mois',
  },
  ar: {
    // Auth
    'auth.welcome': 'مرحباً بك في DP Kid',
    'auth.subtitle': 'منصة رعاية غسيل الكلى للأطفال',
    'auth.loginWithGoogle': 'تسجيل الدخول بواسطة Google',
    'auth.selectRole': 'اختر دورك',
    'auth.patient': 'مريض / ولي أمر',
    'auth.patientDesc': 'الوصول إلى لوحة تحكم المريض',
    'auth.doctor': 'طبيب',
    'auth.doctorDesc': 'الوصول إلى لوحة تحكم الطبيب',
    'auth.admin': 'مسؤول',
    'auth.adminDesc': 'إدارة المنصة',

    // Auth Features
    'auth.feature1.title': 'متابعة الصحة',
    'auth.feature1.desc': 'تابع علاماتك الحيوية وصحتك يومياً',
    'auth.feature2.title': 'تواصل سهل',
    'auth.feature2.desc': 'ابق على تواصل مع فريقك الطبي',
    'auth.feature3.title': 'مساحة تعليمية',
    'auth.feature3.desc': 'تعلم واستمتع مع ألعابنا التفاعلية',

    // Navigation
    'nav.home': 'الرئيسية',
    'nav.education': 'التعليم',
    'nav.healthForm': 'نموذج الصحة',
    'nav.chat': 'الدردشة مع الطبيب',
    'nav.games': 'الألعاب',
    'nav.patients': 'المرضى',
    'nav.analytics': 'التحليلات',
    'nav.userManagement': 'إدارة المستخدمين',
    'nav.statistics': 'الإحصائيات',
    'nav.monitoring': 'المراقبة',
    'nav.logout': 'تسجيل الخروج',

    // Patient Dashboard
    'patient.welcome': 'مرحباً',
    'patient.howAreYou': 'كيف تشعر اليوم؟',
    'patient.education.title': 'مركز التعليم',
    'patient.education.videos': 'فيديوهات تعليمية',
    'patient.education.learn': 'تعلم عن غسيل الكلى',
    'patient.education.hygiene': 'النظافة والعناية',
    'patient.education.treatment': 'عملية العلاج',
    'patient.education.funFacts': 'حقائق ممتعة',

    // Health Form
    'health.title': 'نموذج الصحة اليومي',
    'health.mood': 'كيف تشعر؟',
    'health.moodGreat': 'رائع!',
    'health.moodGood': 'جيد',
    'health.moodOkay': 'لا بأس',
    'health.moodNotGood': 'ليس جيداً',
    'health.moodBad': 'سيء',
    'health.sessionDate': 'تاريخ الجلسة',
    'health.sessionDetails': 'تفاصيل الجلسة',
    'health.duration': 'مدة الجلسة',
    'health.infusedQuantity': 'الكمية المدخلة',
    'health.drainedQuantity': 'الكمية المفرغة',
    'health.painLevel': 'مستوى الألم',
    'health.symptoms': 'الأعراض',
    'health.fatigue': 'تعب',
    'health.nausea': 'غثيان',
    'health.headache': 'صداع',
    'health.dizziness': 'دوخة',
    'health.notes': 'ملاحظات للطبيب',
    'health.submit': 'إرسال',
    'health.submitted': 'تم إرسال النموذج!',

    // Chat
    'chat.title': 'الدردشة مع الطبيب',
    'chat.placeholder': 'اكتب رسالتك...',
    'chat.send': 'إرسال',
    'chat.quickResponses': 'ردود سريعة',
    'chat.howAreYou': 'كيف حالك؟',
    'chat.question': 'لدي سؤال',
    'chat.thankYou': 'شكراً دكتور!',

    // Games
    'games.title': 'منطقة الألعاب',
    'games.educational': 'ألعاب تعليمية',
    'games.relaxation': 'ألعاب استرخاء',
    'games.healthQuiz': 'اختبار الصحة',
    'games.healthQuizDesc': 'تعلم عن الكلى وغسيل الكلى',
    'games.bodyExplorer': 'مستكشف الجسم',
    'games.bodyExplorerDesc': 'اكتشف كيف يعمل جسمك',
    'games.medicineMatch': 'مطابقة الأدوية',
    'games.medicineMatchDesc': 'طابق العلاجات بالأعراض',
    'games.memoryMatch': 'لعبة الذاكرة',
    'games.memoryMatchDesc': 'اقلب البطاقات لتجد الأزواج',
    'games.puzzleGarden': 'حديقة الألغاز',
    'games.puzzleGardenDesc': 'ألغاز مريحة',
    'games.coloringCorner': 'ركن التلوين',
    'games.coloringCornerDesc': 'لون صور جميلة',
    'games.breathingBuddy': 'صديق التنفس',
    'games.breathingBuddyDesc': 'تمارين استرخاء موجهة',
    'games.play': 'العب',
    'games.minutes': 'دقيقة',
    'games.easy': 'سهل',
    'games.medium': 'متوسط',
    'games.hard': 'صعب',

    // Doctor Dashboard
    'doctor.welcome': 'لوحة تحكم الطبيب',
    'doctor.patients': 'مرضاي',
    'doctor.searchPatients': 'البحث عن مرضى...',
    'doctor.filter': 'تصفية',
    'doctor.allStatus': 'جميع الحالات',
    'doctor.active': 'نشط',
    'doctor.recovering': 'في مرحلة التعافي',
    'doctor.critical': 'حرج',
    'doctor.dialysisType': 'نوع غسيل الكلى',
    'doctor.allTypes': 'جميع الأنواع',
    'doctor.lastSession': 'آخر جلسة',
    'doctor.viewDetails': 'عرض التفاصيل',
    'doctor.openChat': 'فتح الدردشة',
    'doctor.schedule': 'جدولة جلسة',

    // Admin Dashboard
    'admin.welcome': 'لوحة تحكم المسؤول',
    'admin.totalPatients': 'إجمالي المرضى',
    'admin.totalDoctors': 'إجمالي الأطباء',
    'admin.activeSessions': 'الجلسات النشطة',
    'admin.satisfaction': 'الرضا',
    'admin.patientsTable': 'إدارة المرضى',
    'admin.doctorsTable': 'إدارة الأطباء',
    'admin.name': 'الاسم',
    'admin.age': 'العمر',
    'admin.assignedDoctor': 'الطبيب المعين',
    'admin.registrationDate': 'تاريخ التسجيل',
    'admin.status': 'الحالة',
    'admin.actions': 'الإجراءات',
    'admin.specialization': 'التخصص',
    'admin.patientCount': 'عدد المرضى',
    'admin.view': 'عرض',
    'admin.edit': 'تعديل',
    'admin.deactivate': 'إلغاء التفعيل',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.years': 'سنة',
    'common.today': 'اليوم',
    'common.yesterday': 'أمس',
    'common.thisWeek': 'هذا الأسبوع',
    'common.thisMonth': 'هذا الشهر',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dp-kid-language');
    return (saved as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dp-kid-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
