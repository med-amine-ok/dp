// Mock data for DP Kid platform

export interface Patient {
  id: string;
  name: string;
  nameFr: string;
  age: number;
  dialysisType: 'HD' | 'PD';
  status: 'active' | 'recovering' | 'critical';
  lastSession: string;
  assignedDoctor: string;
  registrationDate: string;
  avatar: string;
}

export interface Doctor {
  id: string;
  name: string;
  nameFr: string;
  specialization: string;
  patientCount: number;
  activeSessions: number;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface DialysisSession {
  id: string;
  patientId: string;
  date: string;
  duration: number; // in minutes
  weightBefore: number;
  weightAfter: number;
  bloodPressure: string;
  complications: string;
  notes: string;
  status: 'completed' | 'scheduled' | 'missed';
}

export interface Video {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  duration: string;
  category: 'dialysis' | 'hygiene' | 'treatment';
  thumbnail: string;
  progress: number;
}

export interface Game {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  type: 'educational' | 'relaxation';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  icon: string;
  color: string;
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    nameFr: 'Ahmed Mohamed',
    age: 8,
    dialysisType: 'HD',
    status: 'active',
    lastSession: '2024-01-15',
    assignedDoctor: 'Dr. Karim',
    registrationDate: '2023-06-10',
    avatar: '',
  },
  {
    id: '2',
    name: 'سارة علي',
    nameFr: 'Sara Ali',
    age: 10,
    dialysisType: 'PD',
    status: 'recovering',
    lastSession: '2024-01-14',
    assignedDoctor: 'Dr. Fatima',
    registrationDate: '2023-08-22',
    avatar: '',
  },
  {
    id: '3',
    name: 'يوسف حسن',
    nameFr: 'Youssef Hassan',
    age: 6,
    dialysisType: 'HD',
    status: 'active',
    lastSession: '2024-01-15',
    assignedDoctor: 'Dr. Karim',
    registrationDate: '2023-09-05',
    avatar: '',
  },
  {
    id: '4',
    name: 'مريم خالد',
    nameFr: 'Mariam Khaled',
    age: 12,
    dialysisType: 'PD',
    status: 'critical',
    lastSession: '2024-01-13',
    assignedDoctor: 'Dr. Fatima',
    registrationDate: '2023-04-18',
    avatar: '',
  },
  {
    id: '5',
    name: 'عمر سعيد',
    nameFr: 'Omar Said',
    age: 9,
    dialysisType: 'HD',
    status: 'active',
    lastSession: '2024-01-15',
    assignedDoctor: 'Dr. Karim',
    registrationDate: '2023-11-30',
    avatar: '',
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'د. كريم أحمد',
    nameFr: 'Dr. Karim Ahmed',
    specialization: 'Néphrologie pédiatrique',
    patientCount: 15,
    activeSessions: 3,
    avatar: '',
  },
  {
    id: '2',
    name: 'د. فاطمة محمود',
    nameFr: 'Dr. Fatima Mahmoud',
    specialization: 'Néphrologie pédiatrique',
    patientCount: 12,
    activeSessions: 2,
    avatar: '',
  },
  {
    id: '3',
    name: 'د. ياسين بن علي',
    nameFr: 'Dr. Yassine Ben Ali',
    specialization: 'Dialyse pédiatrique',
    patientCount: 8,
    activeSessions: 1,
    avatar: '',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'doctor',
    message: 'Bonjour Ahmed ! Comment te sens-tu aujourd\'hui ?',
    timestamp: '2024-01-15T09:00:00',
    status: 'read',
  },
  {
    id: '2',
    sender: 'patient',
    message: 'Bonjour docteur ! Je me sens bien aujourd\'hui 😊',
    timestamp: '2024-01-15T09:05:00',
    status: 'read',
  },
  {
    id: '3',
    sender: 'doctor',
    message: 'C\'est super ! N\'oublie pas de bien boire de l\'eau avant ta séance.',
    timestamp: '2024-01-15T09:07:00',
    status: 'read',
  },
  {
    id: '4',
    sender: 'patient',
    message: 'D\'accord docteur, merci ! 💧',
    timestamp: '2024-01-15T09:10:00',
    status: 'delivered',
  },
];

export const mockDialysisSessions: DialysisSession[] = [
  {
    id: '1',
    patientId: '1',
    date: '2024-01-15',
    duration: 180,
    weightBefore: 25.5,
    weightAfter: 24.8,
    bloodPressure: '100/65',
    complications: '',
    notes: 'Séance normale, patient en bonne forme',
    status: 'completed',
  },
  {
    id: '2',
    patientId: '1',
    date: '2024-01-17',
    duration: 180,
    weightBefore: 0,
    weightAfter: 0,
    bloodPressure: '',
    complications: '',
    notes: '',
    status: 'scheduled',
  },
  {
    id: '3',
    patientId: '2',
    date: '2024-01-14',
    duration: 240,
    weightBefore: 30.2,
    weightAfter: 29.5,
    bloodPressure: '105/70',
    complications: 'Légère fatigue en fin de séance',
    notes: 'Surveillance accrue recommandée',
    status: 'completed',
  },
];

export const mockVideos: Video[] = [
  {
    id: '1',
    titleFr: 'Comprendre la dialyse',
    titleAr: 'فهم غسيل الكلى',
    descriptionFr: 'Une vidéo simple pour comprendre ce qu\'est la dialyse',
    descriptionAr: 'فيديو بسيط لفهم ما هو غسيل الكلى',
    duration: '5:30',
    category: 'dialysis',
    thumbnail: '',
    progress: 75,
  },
  {
    id: '2',
    titleFr: 'Prendre soin de son accès vasculaire',
    titleAr: 'العناية بالوصول الوعائي',
    descriptionFr: 'Comment garder ton accès propre et en bonne santé',
    descriptionAr: 'كيفية الحفاظ على نظافة وصحة الوصول الخاص بك',
    duration: '4:15',
    category: 'hygiene',
    thumbnail: '',
    progress: 100,
  },
  {
    id: '3',
    titleFr: 'Le jour de ta séance',
    titleAr: 'يوم جلستك',
    descriptionFr: 'Ce qui se passe pendant une séance de dialyse',
    descriptionAr: 'ما يحدث خلال جلسة غسيل الكلى',
    duration: '6:00',
    category: 'treatment',
    thumbnail: '',
    progress: 30,
  },
  {
    id: '4',
    titleFr: 'Bien manger pour des reins en forme',
    titleAr: 'الأكل الصحي لكلى سليمة',
    descriptionFr: 'Les aliments qui aident tes reins',
    descriptionAr: 'الأطعمة التي تساعد كليتيك',
    duration: '4:45',
    category: 'hygiene',
    thumbnail: '',
    progress: 0,
  },
];

export const mockGames: Game[] = [
  {
    id: '1',
    titleFr: 'Quiz Santé',
    titleAr: 'اختبار الصحة',
    descriptionFr: 'Teste tes connaissances sur les reins',
    descriptionAr: 'اختبر معلوماتك عن الكلى',
    type: 'educational',
    difficulty: 'easy',
    duration: 10,
    icon: '🧠',
    color: 'playful-purple',
  },
  {
    id: '2',
    titleFr: 'Explorateur du Corps',
    titleAr: 'مستكشف الجسم',
    descriptionFr: 'Découvre comment fonctionne ton corps',
    descriptionAr: 'اكتشف كيف يعمل جسمك',
    type: 'educational',
    difficulty: 'medium',
    duration: 15,
    icon: '🔬',
    color: 'playful-green',
  },
  {
    id: '3',
    titleFr: 'Association Médicaments',
    titleAr: 'مطابقة الأدوية',
    descriptionFr: 'Associe les traitements aux symptômes',
    descriptionAr: 'طابق العلاجات بالأعراض',
    type: 'educational',
    difficulty: 'hard',
    duration: 12,
    icon: '💊',
    color: 'playful-pink',
  },
  {
    id: '4',
    titleFr: 'Jeu de Mémoire',
    titleAr: 'لعبة الذاكرة',
    descriptionFr: 'Retourne les cartes pour trouver les paires',
    descriptionAr: 'اقلب البطاقات لتجد الأزواج',
    type: 'relaxation',
    difficulty: 'easy',
    duration: 5,
    icon: '🎴',
    color: 'playful-orange',
  },
  {
    id: '5',
    titleFr: 'Jardin Puzzle',
    titleAr: 'حديقة الألغاز',
    descriptionFr: 'Puzzles relaxants avec de jolies images',
    descriptionAr: 'ألغاز مريحة مع صور جميلة',
    type: 'relaxation',
    difficulty: 'medium',
    duration: 8,
    icon: '🧩',
    color: 'playful-green',
  },
  {
    id: '6',
    titleFr: 'Coin Coloriage',
    titleAr: 'ركن التلوين',
    descriptionFr: 'Colorie de belles images',
    descriptionAr: 'لون صور جميلة',
    type: 'relaxation',
    difficulty: 'easy',
    duration: 10,
    icon: '🎨',
    color: 'playful-yellow',
  },
  {
    id: '7',
    titleFr: 'Ami Respiration',
    titleAr: 'صديق التنفس',
    descriptionFr: 'Exercices de relaxation guidés',
    descriptionAr: 'تمارين استرخاء موجهة',
    type: 'relaxation',
    difficulty: 'easy',
    duration: 5,
    icon: '🌬️',
    color: 'playful-purple',
  },
];

export const mockAnalytics = {
  totalPatients: 127,
  totalDoctors: 12,
  activeSessions: 8,
  satisfactionRate: 94,
  weeklyStats: [
    { day: 'Lun', sessions: 12 },
    { day: 'Mar', sessions: 15 },
    { day: 'Mer', sessions: 18 },
    { day: 'Jeu', sessions: 14 },
    { day: 'Ven', sessions: 16 },
    { day: 'Sam', sessions: 8 },
    { day: 'Dim', sessions: 5 },
  ],
  dialysisTypes: [
    { type: 'HD', count: 78 },
    { type: 'PD', count: 49 },
  ],
  ageGroups: [
    { group: '0-5', count: 25 },
    { group: '6-10', count: 52 },
    { group: '11-15', count: 38 },
    { group: '16-18', count: 12 },
  ],
};
