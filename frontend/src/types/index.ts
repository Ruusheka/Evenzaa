// ─── User Roles ────────────────────────────────────────────────
export type Role = 'STUDENT' | 'FACULTY';

// ─── User object stored in auth context ────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNo?: number;       // Student only
  department?: string;   // Student only
}

// ─── Auth state persisted to localStorage ──────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
}

// ─── Event entity (mirrors Spring Boot Event.java) ─────────────
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;           // ISO date string e.g. "2026-04-15"
  time?: string;          // e.g. "09:00 AM"
  venue: string;
  facultyId: string;
  totalSeats: number;
  availableSeats: number;
  registeredStudents: number[];
  cancelledStudents: number[];
}

// ─── Student entity ────────────────────────────────────────────
export interface Student {
  id: string;
  name: string;
  rollNo: number;
  email: string;
  phone?: string;
  department?: string;
}

// ─── Faculty entity ────────────────────────────────────────────
export interface Faculty {
  id: string;
  name: string;
  email: string;
  facultyId?: string;
  department?: string;
}

// ─── API response wrappers ─────────────────────────────────────
export interface ApiMessage {
  message: string;
}

// ─── Toast notification types ─────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
