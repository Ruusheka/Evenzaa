import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Hash, ArrowRight, Loader2, Eye, EyeOff, GraduationCap, Briefcase, Zap, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import toast from 'react-hot-toast';

type Tab = 'student' | 'faculty';
type View = 'login' | 'register';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [tab, setTab]   = useState<Tab>(searchParams.get('tab') === 'faculty' ? 'faculty' : 'student');
  const [view, setView] = useState<View>(searchParams.get('register') ? 'register' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form
  const [regForm, setRegForm] = useState({
    name: '', rollNo: '', email: '', password: '', department: '', phone: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ── Student Login ──────────────────────────────────────────
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.studentLogin(loginForm);
      if (res?.token && res?.student) {
        login(res.token, {
          id: res.student.id,
          name: res.student.name,
          email: res.student.email,
          role: 'STUDENT',
          rollNo: res.student.rollNo,
          department: res.student.department,
        });
        toast.success(`Welcome back, ${res.student.name}! 🎉`);
        navigate('/student/dashboard');
      } else {
        toast.error(res?.error || 'Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Faculty Login ──────────────────────────────────────────
  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await api.facultyLogin(loginForm);
      if (token && typeof token === 'string' && token !== 'Invalid credentials') {
        login(token, {
          id: 'faculty',
          name: loginForm.email.split('@')[0],
          email: loginForm.email,
          role: 'FACULTY',
        });
        toast.success('Faculty dashboard loaded!');
        navigate('/faculty/dashboard');
      } else {
        toast.error('Invalid credentials. Access denied.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Student Register ───────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.studentRegister({ ...regForm, rollNo: parseInt(regForm.rollNo) || 0 });
      toast.success('Account created! Please log in.');
      setView('login');
      setRegForm({ name: '', rollNo: '', email: '', password: '', department: '', phone: '' });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'none' }}>

      {/* ── LEFT PANEL (event-themed illustration) ──────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(160deg, #0A172C 0%, #1A3A6B 60%, #243B6E 100%)',
        }}
      >
        {/* Background geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-10"
               style={{ background: '#FF6B00' }} />
          <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-8"
               style={{ background: '#FF6B00' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
               style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }} />
        </div>

        {/* Logo / Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #FF6B00, #E05E00)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white text-2xl font-black tracking-tight">Evenza</span>
          </div>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Event Management Portal
          </p>
        </div>

        {/* Central illustration content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-16">
          <div className="w-32 h-32 rounded-3xl mb-8 flex items-center justify-center mx-auto"
               style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)' }}>
            <Calendar size={56} style={{ color: '#FF6B00' }} />
          </div>

          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Your Campus<br />
            <span style={{ color: '#FF6B00' }}>Comes Alive</span><br />
            Here
          </h1>
          <p className="text-base leading-relaxed max-w-sm"
             style={{ color: 'rgba(255,255,255,0.55)' }}>
            Discover events, track registrations, and manage every campus initiative — all in one place.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-sm">
            {[
              { icon: Calendar, label: 'Events', value: '50+' },
              { icon: Users,    label: 'Students', value: '2K+' },
              { icon: Zap,      label: 'Live',  value: '100%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl p-4 text-center"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon size={18} style={{ color: '#FF6B00', margin: '0 auto 6px' }} />
                <p className="text-white font-black text-lg leading-none">{value}</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
            "Every great event starts with a single registration."
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (login card) ─────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
        style={{ background: 'linear-gradient(180deg, #0D1F40 0%, #12294D 100%)' }}
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #FF6B00, #E05E00)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-white text-xl font-black tracking-tight">Evenza</span>
          </div>

          {view === 'register' ? (
            /* ── REGISTER FORM ──────────────────────────────── */
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-1">Create Account</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Join Evenza as a student</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="col-span-2">
                    <label className="form-label">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                            style={{ color: 'rgba(255,255,255,0.35)' }} />
                      <input type="text" required value={regForm.name}
                        onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                        className="input-field pl-10" placeholder="Arjun Kumar" />
                    </div>
                  </div>

                  {/* Roll No */}
                  <div>
                    <label className="form-label">Roll Number</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                            style={{ color: 'rgba(255,255,255,0.35)' }} />
                      <input type="number" required value={regForm.rollNo}
                        onChange={e => setRegForm(p => ({ ...p, rollNo: e.target.value }))}
                        className="input-field pl-10" placeholder="23001" />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="form-label">Department</label>
                    <input type="text" required value={regForm.department}
                      onChange={e => setRegForm(p => ({ ...p, department: e.target.value }))}
                      className="input-field" placeholder="CSE" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input type="email" required value={regForm.email}
                      onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                      className="input-field pl-10" placeholder="student@ssn.edu.in" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input type={showPass ? 'text' : 'password'} required value={regForm.password}
                      onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                      className="input-field pl-10 pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-orange w-full py-3.5 mt-2 text-sm font-bold rounded-xl"
                  style={{ marginTop: '8px' }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
                </button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Already have an account?{' '}
                <button onClick={() => setView('login')}
                  className="font-bold" style={{ color: '#FF9A47' }}>
                  Sign in
                </button>
              </p>
            </>
          ) : (
            /* ── LOGIN FORM ─────────────────────────────────── */
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-1">Welcome Back</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
                  Evenza – Event Management Portal
                </p>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl p-1 mb-8"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setTab('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    tab === 'student'
                      ? 'text-white shadow-md'
                      : 'hover:text-white'
                  }`}
                  style={tab === 'student'
                    ? { background: 'linear-gradient(135deg, #FF6B00, #E05E00)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.5)' }}>
                  <GraduationCap size={16} /> Student
                </button>
                <button
                  onClick={() => setTab('faculty')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    tab === 'faculty'
                      ? 'text-white shadow-md'
                      : 'hover:text-white'
                  }`}
                  style={tab === 'faculty'
                    ? { background: 'linear-gradient(135deg, #FF6B00, #E05E00)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.5)' }}>
                  <Briefcase size={16} /> Faculty
                </button>
              </div>

              <form onSubmit={tab === 'student' ? handleStudentLogin : handleFacultyLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input type="email" required value={loginForm.email}
                      onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      className="input-field pl-10"
                      placeholder={tab === 'student' ? 'student@ssn.edu.in' : 'faculty@ssn.edu.in'} />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input type={showPass ? 'text' : 'password'} required value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      className="input-field pl-10 pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-orange w-full py-3.5 text-sm font-bold rounded-xl"
                  style={{ marginTop: '8px' }}>
                  {loading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <>Sign In <ArrowRight size={16} /></>
                  }
                </button>
              </form>

              {/* Register link (student only) */}
              {tab === 'student' && (
                <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  New student?{' '}
                  <button onClick={() => setView('register')}
                    className="font-bold" style={{ color: '#FF9A47' }}>
                    Create account
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
