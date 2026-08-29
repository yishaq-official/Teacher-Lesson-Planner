export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  institution?: string;
  subject?: string;
}

export interface Resource {
  _id: string;
  teacherId: User | string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  topic: string;
  type: 'worksheet' | 'presentation' | 'exercise' | 'exam' | 'notes' | 'other';
  tags: string[];
  fileUrl: string;
  publicId: string;
  fileType: string;
  fileSize: number;
  downloadsCount: number;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonPlan {
  _id: string;
  teacherId: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  date: string;
  duration: number;
  period?: string;
  objectives: string[];
  introduction: string;
  mainActivity: string;
  practiceActivity: string;
  conclusion: string;
  homework: string;
  teacherNotes: string;
  status: 'upcoming' | 'completed';
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLessons: number;
  upcomingCount: number;
  completedCount: number;
  myResourcesCount: number;
}
