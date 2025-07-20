import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ModalProvider } from './contexts/ModalContext';
import { Navbar } from './components/navigation/Navbar';
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { StudentManagementPage } from './pages/features/StudentManagementPage';
import { SmartSchedulingPage } from './pages/features/SmartSchedulingPage';
import { FleetManagementPage } from './pages/features/FleetManagementPage';
import { ExamsEvaluationsPage } from './pages/features/ExamsEvaluationsPage';
import { CommunicationPage } from './pages/features/CommunicationPage';
import { ReportsAnalyticsPage } from './pages/features/ReportsAnalyticsPage';
import { LoginPage } from './pages/auth/LoginPage';
import LoginDrivingSchool from './pages/auth/LoginDrivingSchool';
import LoginStudent from './pages/auth/LoginStudent';
import LoginInstructor from './pages/auth/LoginInstructor';
import { RegisterPage } from './pages/auth/RegisterPage';
import { RegistrationSuccessPage } from './pages/auth/RegistrationSuccessPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import StudentsPage from './pages/dashboard/StudentsPage';
import StudentProfilePage from './pages/dashboard/StudentProfilePage';
import StudentSchedulePage from './pages/dashboard/StudentSchedulePage';
import StudentExamsPage from './pages/dashboard/StudentExamsPage';
import InstructorsPage from './pages/dashboard/InstructorsPage';
import InstructorProfilePage from './pages/dashboard/InstructorProfilePage';
import VehiclesPage from './pages/dashboard/VehiclesPage';
import VehicleProfilePage from './pages/dashboard/VehicleProfilePage';
import SchedulePage from './pages/dashboard/SchedulePage';
import InstructorSchedulePage from './pages/dashboard/InstructorSchedulePage';
import ExamsPage from './pages/dashboard/ExamsPage';
import ExamDetailPage from './pages/dashboard/ExamDetailPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import StudentPaymentsPage from './pages/dashboard/StudentPaymentsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';
import SupportPage from './pages/dashboard/SupportPage';
import PaymentPage from './pages/dashboard/PaymentPage';
import VehicleExpensesPage from './pages/dashboard/VehicleExpensesPage';
import AccountingPage from './pages/dashboard/AccountingPage';

// Pages admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DrivingSchoolsManagement from './pages/admin/DrivingSchoolsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import ContactFormsManagement from './pages/admin/ContactFormsManagement';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import CouponsManagement from './pages/admin/CouponsManagement';
import WaitingApprovalPage from './pages/WaitingApprovalPage';

import SystemTestPage from './pages/test/SystemTestPage';

import AdminLayout from './layouts/AdminLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Conditional Instructor Schedule Component
const ConditionalInstructorSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // If user is an instructor and no instructor parameter is specified,
    // automatically redirect to their own instructor schedule
    if (user?.user_type === 'instructor' && !location.search.includes('instructor=')) {
      const instructorId = user.instructor_profile?.id;
      if (instructorId) {
        navigate(`/dashboard/instructor-schedule?instructor=${instructorId}`, { replace: true });
      }
    }
  }, [user, location.search, navigate]);

  // Always use the same InstructorSchedulePage component
  return <InstructorSchedulePage />;
};

// Conditional Student Schedule Component
const ConditionalStudentSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // If user is a student, automatically redirect to their own student schedule
    if (user?.user_type === 'student') {
      const studentId = user.student_profile?.id;
      if (studentId) {
        navigate(`/dashboard/students/${studentId}/schedule`, { replace: true });
      }
    }
  }, [user, location.search, navigate]);

  // Always use the same StudentSchedulePage component
  return <StudentSchedulePage />;
};

// Conditional Schedule Component - redirects based on user type
const ConditionalSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.user_type === 'student') {
      // Redirect students to their specific schedule page
      const studentId = user.student_profile?.id;
      if (studentId) {
        navigate(`/dashboard/students/${studentId}/schedule`, { replace: true });
      }
    } else if (user?.user_type === 'instructor') {
      // Redirect instructors to their specific schedule page
      const instructorId = user.instructor_profile?.id;
      if (instructorId) {
        navigate(`/dashboard/instructor-schedule?instructor=${instructorId}`, { replace: true });
      }
    }
    // Auto-écoles restent sur la page normale
  }, [user, navigate]);

  // For driving schools, show the normal schedule page
  return <SchedulePage />;
};

// Component to protect driving school routes from instructors
const DrivingSchoolRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.user_type === 'instructor') {
      // Redirect instructors to their dashboard (sans replace: true pour éviter le refresh)
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // If user is an instructor, show access denied message during redirect
  if (user?.user_type === 'instructor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Accès non autorisé. Redirection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes with Navbar */}
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <LandingPage />
            </main>
          </div>
        } />
        <Route path="/features" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <FeaturesPage />
            </main>
          </div>
        } />
        <Route path="/pricing" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <PricingPage />
            </main>
          </div>
        } />
        <Route path="/about" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <AboutPage />
            </main>
          </div>
        } />
        <Route path="/contact" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <ContactPage />
            </main>
          </div>
        } />
        <Route path="/features/student-management" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <StudentManagementPage />
            </main>
          </div>
        } />
        <Route path="/features/smart-scheduling" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <SmartSchedulingPage />
            </main>
          </div>
        } />
        <Route path="/features/fleet-management" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <FleetManagementPage />
            </main>
          </div>
        } />
        <Route path="/features/exams-evaluations" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <ExamsEvaluationsPage />
            </main>
          </div>
        } />
        <Route path="/features/communication" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <CommunicationPage />
            </main>
          </div>
        } />
        <Route path="/features/reports-analytics" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <ReportsAnalyticsPage />
            </main>
          </div>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main>
                <LoginPage />
              </main>
            </div>
          </PublicRoute>
        } />
        <Route path="/login/driving-school" element={
          <PublicRoute>
            <LoginDrivingSchool />
          </PublicRoute>
        } />
        <Route path="/login/student" element={
          <PublicRoute>
            <LoginStudent />
          </PublicRoute>
        } />
        <Route path="/login/instructor" element={
          <PublicRoute>
            <LoginInstructor />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main>
                <RegisterPage />
              </main>
            </div>
          </PublicRoute>
        } />
        <Route path="/registration-success" element={
          <PublicRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main>
                <RegistrationSuccessPage />
              </main>
            </div>
          </PublicRoute>
        } />
        <Route path="/waiting" element={
          <ProtectedRoute>
            <WaitingApprovalPage />
          </ProtectedRoute>
        } />

        {/* Test routes */}
        <Route path="/test/system" element={<SystemTestPage />} />

        {/* Dashboard routes with DashboardLayout (no Navbar) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <OverviewPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/students" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/students/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/students/:studentId/schedule" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/students/:studentId/exams" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentExamsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/instructors" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <InstructorsPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/instructors/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InstructorProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vehicles" element={
          <ProtectedRoute>
            <DashboardLayout>
              <VehiclesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/vehicles/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <VehicleProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/schedule" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ConditionalSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/instructor-schedule" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ConditionalInstructorSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/exams" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ExamsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/exams/:examId" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ExamDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/payments" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <PaymentsPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/students/:studentId/payments" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentPaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/subscription" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <SubscriptionPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/support" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <SupportPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/payment/:planId" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <PaymentPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/vehicle-expenses" element={
          <ProtectedRoute>
            <DashboardLayout>
              <VehicleExpensesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/accounting" element={
          <ProtectedRoute>
            <DrivingSchoolRoute>
              <DashboardLayout>
                <AccountingPage />
              </DashboardLayout>
            </DrivingSchoolRoute>
          </ProtectedRoute>
        } />

        {/* Routes admin */}
        <Route path="/administrateur_permini" element={<AdminLoginPage />} />
        <Route path="/administrateur_permini/dashboard" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />
        <Route path="/administrateur_permini/driving-schools" element={
          <AdminLayout>
            <DrivingSchoolsManagement />
          </AdminLayout>
        } />
        <Route path="/administrateur_permini/users" element={
          <AdminLayout>
            <UsersManagement />
          </AdminLayout>
        } />
        <Route path="/administrateur_permini/payments" element={
          <AdminLayout>
            <PaymentsManagement />
          </AdminLayout>
        } />
        <Route path="/administrateur_permini/contact-forms" element={
          <AdminLayout>
            <ContactFormsManagement />
          </AdminLayout>
        } />
        <Route path="/administrateur_permini/logs" element={
          <AdminLayout>
            <ActivityLogsPage />
          </AdminLayout>
        } />
        <Route path="/administrateur_permini/coupons" element={
          <AdminLayout>
            <CouponsManagement />
          </AdminLayout>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ModalProvider>
            <Router>
              <AppContent />
            </Router>
          </ModalProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;