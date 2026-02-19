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


