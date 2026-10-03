import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Emergency } from './pages/Emergency';
import { EmergencyActive } from './pages/EmergencyActive';
import { Appointments } from './pages/Appointments';
import { TokenPage } from './pages/Token';
import { PortalLogin } from './pages/PortalLogin';
import { PortalDashboard } from './pages/PortalDashboard';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { LeaveNow } from './pages/LeaveNow';
import { Activity } from './pages/Activity';
import { HospitalDetail } from './pages/HospitalDetail';
import { Profile } from './pages/Profile';
import { MedicalRecords } from './pages/MedicalRecords';
import { Feedback } from './pages/Feedback';
import { FamilyManager } from './pages/FamilyManager';
import { WellnessHub } from './pages/WellnessHub';
import { N8NHub } from './pages/N8NHub';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Onboarding },
      { path: 'home', Component: Home },
      { path: 'emergency', Component: Emergency },
      { path: 'emergency-active', Component: EmergencyActive },
      { path: 'appointments', Component: Appointments },
      { path: 'token', Component: TokenPage },
      { path: 'leave-now', Component: LeaveNow },
      { path: 'activity', Component: Activity },
      { path: 'settings', Component: Settings },
      { path: 'help', Component: Help },
      { path: 'hospital/:id', Component: HospitalDetail },
      { path: 'profile', Component: Profile },
      { path: 'records', Component: MedicalRecords },
      { path: 'feedback', Component: Feedback },
      { path: 'family', Component: FamilyManager },
      { path: 'wellness', Component: WellnessHub },
      { path: 'portal', Component: PortalLogin },
      { path: 'portal/dashboard', Component: PortalDashboard },
      { path: 'n8n', Component: N8NHub },
    ],
  },
]);
