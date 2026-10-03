import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EmergencyAlert, MOCK_TOKENS, MOCK_EMERGENCIES } from '../constants/mockData';
import { Token, TokenStatus, Referral } from '../types/token';
import { PatientProfile, MOCK_FAMILY_MEMBERS } from '../types/patient';
import { ReminderService } from '../services/ReminderService';
import { WellnessLog, WellnessMetricType } from '../types/wellness';
import { CommunityAlert, MOCK_COMMUNITY_ALERTS } from '../constants/communityData';
import { FollowUpResponse } from '../services/followUpService';
import { toast } from 'sonner';
import { n8nService } from '../services/n8nService';

export type UserToken = Token & {
  userId?: string;
};

export type ActiveEmergency = {
  sessionId: string;
  hospitalId?: string;
  startedAt: string;
  status: 'active' | 'cancelled' | 'arrived' | 'false_alarm';
};

export type ActiveJourney = {
  tokenId: string;
  hospitalId: string;
  startedAt: string;
  etaMinutes: number;
};

const STORAGE_KEYS = {
  TOKENS: 'acc_user_tokens',
  EMERGENCY: 'acc_active_emergency',
  NOTIFICATIONS: 'acc_notifications_enabled',
  FAMILY: 'acc_family_members',
  CURRENT_PATIENT: 'acc_current_patient_id',
  WELLNESS: 'acc_wellness_logs',
};

type AppStateContextType = {
  // User tokens (patient side)
  userTokens: UserToken[];
  addToken: (token: Omit<UserToken, 'id' | 'bookedAt' | 'tokenNo' | 'status' | 'remindersSent' | 'noShowRisk' | 'waitTimeMinutes'>) => UserToken;
  updateTokenStatus: (tokenId: string, status: TokenStatus) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  isOffline: boolean;

  // Family / Patients
  familyMembers: PatientProfile[];
  currentPatientId: string;
  setCurrentPatientId: (id: string) => void;
  addFamilyMember: (member: Omit<PatientProfile, 'id'>) => void;
  
  // Wellness & Community
  wellnessLogs: WellnessLog[];
  addWellnessLog: (type: WellnessMetricType, value: number, unit: string, note?: string) => void;
  communityAlerts: CommunityAlert[];

  // Referrals
  createReferral: (token: UserToken, toDept: string, reason: string) => void;

  // Emergency session
  activeEmergency: ActiveEmergency | null;
  startEmergency: (hospitalId?: string) => ActiveEmergency;
  stopEmergency: (reason: 'arrived' | 'cancelled' | 'false_alarm') => void;

  // Leave-now journey
  activeJourney: ActiveJourney | null;
  startJourney: (tokenId: string, hospitalId: string, etaMins: number) => void;
  stopJourney: () => void;

  // Portal state (staff side)
  portalAlerts: EmergencyAlert[];
  portalQueue: UserToken[];
  acceptAlert: (alertId: string) => void;
  declineAlert: (alertId: string) => void;
  markFalseAlarm: (alertId: string) => void;
  notifyPatient: (tokenId: string) => void;
  markServed: (tokenId: string) => void;
  advanceQueue: (tokenId: string) => void;

  // Shared notification (simulated push)
  pendingNotification: { tokenId: string; tokenNo: string; department: string } | null;
  clearNotification: () => void;
  
  // Login State (Mock Phase A)
  userRole: 'Doctor' | 'Reception' | 'Patient' | null;
  login: (email: string, role: 'Doctor' | 'Reception') => void;
  logout: () => void;

  // AI Follow-Up
  followUpResponses: FollowUpResponse[];
  addFollowUpResponse: (response: FollowUpResponse) => void;

  // AI Priority Queue toggle (staff)
  aiQueuePriority: boolean;
  toggleAiPriority: () => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

let tokenCounter = 20;
const generateTokenNumber = (dept: string): string => {
  const prefix = dept.charAt(0).toUpperCase();
  tokenCounter += 1;
  return `${prefix}-${tokenCounter}`;
};

const calculateNoShowRisk = (bookedAt: string, appointmentTime: string): 'High' | 'Medium' | 'Low' => {
  if (!appointmentTime) return 'Low';
  
  const booked = new Date(bookedAt).getTime();
  const appointment = new Date().getTime(); // Mocking today's date for appointment
  const leadTimeHours = (appointment - booked) / (1000 * 60 * 60);

  if (leadTimeHours > 48) return 'High';
  if (leadTimeHours > 12) return 'Medium';
  return 'Low';
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [userTokens, setUserTokens] = React.useState<UserToken[]>([]);
  const [activeEmergency, setActiveEmergency] = React.useState<ActiveEmergency | null>(null);
  const [activeJourney, setActiveJourney] = React.useState<ActiveJourney | null>(null);
  const [portalAlerts, setPortalAlerts] = React.useState<EmergencyAlert[]>(MOCK_EMERGENCIES);
  const [portalQueue, setPortalQueue] = React.useState<UserToken[]>(MOCK_TOKENS);
  const [pendingNotification, setPendingNotification] = React.useState<AppStateContextType['pendingNotification']>(null);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [userRole, setUserRole] = React.useState<'Doctor' | 'Reception' | 'Patient' | null>(null);
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [familyMembers, setFamilyMembers] = React.useState<PatientProfile[]>(MOCK_FAMILY_MEMBERS);
  const [currentPatientId, setCurrentPatientId] = React.useState<string>(MOCK_FAMILY_MEMBERS[0].id);
  const [wellnessLogs, setWellnessLogs] = React.useState<WellnessLog[]>([]);
  const [communityAlerts, setCommunityAlerts] = React.useState<CommunityAlert[]>(MOCK_COMMUNITY_ALERTS);
  const [followUpResponses, setFollowUpResponses] = React.useState<FollowUpResponse[]>([]);
  const [aiQueuePriority, setAiQueuePriority] = React.useState(true);

  const fireN8nEvent = useCallback((event: 'token_created' | 'emergency_triggered' | 'patient_served' | 'wellness_logged', payload: any) => {
    setTimeout(() => {
      n8nService.triggerWebhook(event, payload).catch(err => {
        console.error(`n8n event ${event} trigger error:`, err);
      });
    }, 0);
  }, []);

  // 1. Hydration from LocalStorage
  React.useEffect(() => {
    const savedTokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
    const savedEmergency = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
    const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const savedFamily = localStorage.getItem(STORAGE_KEYS.FAMILY);
    const savedCurrentPatient = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT);

    if (savedTokens) {
      try {
        const parsed = JSON.parse(savedTokens);
        setUserTokens(parsed);
      } catch (e) {
        console.error('Failed to parse tokens', e);
      }
    }

    if (savedEmergency) {
      try {
        const parsed = JSON.parse(savedEmergency);
        setActiveEmergency(parsed);
      } catch (e) {
        console.error('Failed to parse emergency', e);
      }
    }

    if (savedNotifs !== null) {
      setNotificationsEnabled(savedNotifs === 'true');
    }

    if (savedFamily) {
      try {
        setFamilyMembers(JSON.parse(savedFamily));
      } catch (e) {}
    }

    if (savedCurrentPatient) {
      setCurrentPatientId(savedCurrentPatient);
    }
    
    const savedWellness = localStorage.getItem(STORAGE_KEYS.WELLNESS);
    if (savedWellness) {
      try { setWellnessLogs(JSON.parse(savedWellness)); } catch (e) {}
    }
  }, []);

  // 2. Persistence to LocalStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(userTokens));
  }, [userTokens]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(familyMembers));
  }, [familyMembers]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, currentPatientId);
  }, [currentPatientId]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(wellnessLogs));
  }, [wellnessLogs]);

  // Persist portal queue too for mock consistency
  React.useEffect(() => {
    // Only persist if we have tokens (to avoid overwriting with empty on first load before hydration)
    if (userTokens.length > 0) {
      // In a real app, this would be a server-side shared state
    }
  }, [userTokens]);

  React.useEffect(() => {
    if (activeEmergency) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(activeEmergency));
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMERGENCY);
    }
  }, [activeEmergency]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(notificationsEnabled));
  }, [notificationsEnabled]);

  // 3. Connectivity detection
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = useCallback((email: string, role: 'Doctor' | 'Reception') => {
    setUserRole(role);
  }, []);

  const logout = useCallback(() => {
    setUserRole(null);
  }, []);

  const addToken = useCallback((tokenData: Omit<UserToken, 'id' | 'bookedAt' | 'tokenNo' | 'status' | 'remindersSent' | 'noShowRisk' | 'waitTimeMinutes'>): UserToken => {
    // 1. Generate base token
    const newToken: UserToken = {
      ...tokenData,
      id: `ut_${Date.now()}`,
      patientId: currentPatientId,
      tokenNo: generateTokenNumber(tokenData.department || 'GP'),
      bookedAt: new Date().toISOString(),
      status: 'Booked',
      remindersSent: { sms: false, email: false, whatsapp: false },
      noShowRisk: calculateNoShowRisk(new Date().toISOString(), tokenData.appointmentTime),
      waitTimeMinutes: 20, // Default
      position: portalQueue.filter(t => t.status === 'Booked').length + 1,
      totalInQueue: portalQueue.filter(t => t.status === 'Booked').length + 1,
    } as UserToken;

    // 2. Priority Logic: If Urgent/Emergency, move to top and shuffle others
    if (newToken.urgency && newToken.urgency !== 'Routine') {
      const priorityPos = newToken.urgency === 'Emergency' ? 1 : 2;
      newToken.position = priorityPos;
      newToken.waitTimeMinutes = priorityPos === 1 ? 5 : 10;

      // Update existing queue: shift those at or after priorityPos down
      setPortalQueue(prev => {
        const updated = prev.map(t => {
          if (t.status === 'Booked' && (t.position || 0) >= priorityPos) {
            return {
              ...t,
              position: (t.position || 0) + 1,
              waitTimeMinutes: (t.waitTimeMinutes || 0) + 10,
              totalInQueue: (t.totalInQueue || 0) + 1
            };
          }
          return { ...t, totalInQueue: (t.totalInQueue || 0) + 1 };
        });
        return [...updated, newToken].sort((a, b) => (a.position || 99) - (b.position || 99));
      });

      setUserTokens(prev => [newToken, ...prev]);
    } else {
      // Routine logic: add to end
      setUserTokens(prev => [newToken, ...prev]);
      setPortalQueue(prev => {
        const updated = prev.map(t => ({ ...t, totalInQueue: (t.totalInQueue || 0) + 1 }));
        return [...updated, newToken];
      });
    }
    
    // Trigger automated communications
    ReminderService.sendBookingConfirmation(newToken);
    fireN8nEvent('token_created', newToken);
    
    return newToken;
  }, [currentPatientId, portalQueue, fireN8nEvent]);

  const addFamilyMember = useCallback((member: Omit<PatientProfile, 'id'>) => {
    const newMember: PatientProfile = {
      ...member,
      id: `p_${Date.now()}`,
    };
    setFamilyMembers(prev => [...prev, newMember]);
  }, []);

  const updateTokenStatus = useCallback((tokenId: string, status: TokenStatus) => {
    setUserTokens(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, status } : t))
    );
    setPortalQueue(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, status } : t))
    );
  }, []);

  const addWellnessLog = useCallback((type: WellnessMetricType, value: number, unit: string, note?: string) => {
    const newLog: WellnessLog = {
      id: `wl_${Date.now()}`,
      patientId: currentPatientId,
      type,
      value,
      unit,
      note,
      timestamp: new Date().toISOString(),
    };
    setWellnessLogs(prev => [newLog, ...prev]);
    toast.success(`${type} logged successfully`);
    fireN8nEvent('wellness_logged', newLog);
  }, [currentPatientId, fireN8nEvent]);

  const createReferral = useCallback((token: UserToken, toDept: string, reason: string) => {
    const referral: Referral = {
      id: `ref_${Date.now()}`,
      fromDoctorId: 'd_1', // Mocking current doctor
      fromDoctorName: token.doctorName || 'General Practitioner',
      toDepartment: toDept,
      reason,
      date: new Date().toISOString(),
      status: 'Pending'
    };
    
    setUserTokens(prev => prev.map(t => t.id === token.id ? { ...t, referralId: referral.id, referralData: referral } : t));
    setPortalQueue(prev => prev.map(t => t.id === token.id ? { ...t, referralId: referral.id, referralData: referral } : t));
    toast.success(`Referral to ${toDept} created.`);
  }, []);

  const startEmergency = useCallback((hospitalId?: string): ActiveEmergency => {
    const session: ActiveEmergency = {
      sessionId: `sess_${Date.now()}`,
      hospitalId,
      startedAt: new Date().toISOString(),
      status: 'active',
    };
    setActiveEmergency(session);

    // Simulate hospital portal getting notified — add to portal alerts
    const newAlert: EmergencyAlert = {
      id: `e_${Date.now()}`,
      patientPhone: '+91 98765 43999',
      patientName: 'Current User',
      hospitalId,
      eta: Math.floor(Math.random() * 10) + 3,
      area: 'Airoli Sector 6',
      status: 'pending',
      timestamp: new Date().toISOString(),
      lat: 19.148,
      lng: 72.996,
      note: 'User-initiated emergency via app',
    };
    setPortalAlerts(prev => [newAlert, ...prev]);
    fireN8nEvent('emergency_triggered', newAlert);

    return session;
  }, [fireN8nEvent]);

  const stopEmergency = useCallback((reason: 'arrived' | 'cancelled' | 'false_alarm') => {
    setActiveEmergency(prev => prev ? { ...prev, status: reason } : null);
    setTimeout(() => setActiveEmergency(null), 1000);
  }, []);

  const startJourney = useCallback((tokenId: string, hospitalId: string, etaMins: number) => {
    setActiveJourney({ tokenId, hospitalId, startedAt: new Date().toISOString(), etaMinutes: etaMins });
    updateTokenStatus(tokenId, 'Arrived');
  }, [updateTokenStatus]);

  const stopJourney = useCallback(() => {
    setActiveJourney(null);
  }, []);

  // Portal actions
  const acceptAlert = useCallback((alertId: string) => {
    setPortalAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'accepted' as const } : a))
    );
  }, []);

  const declineAlert = useCallback((alertId: string) => {
    setPortalAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'declined' as const } : a))
    );
  }, []);

  const markFalseAlarm = useCallback((alertId: string) => {
    setPortalAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const notifyPatient = useCallback((tokenId: string) => {
    const token = portalQueue.find(t => t.id === tokenId);
    if (!token) return;
    // Update portal queue
    setPortalQueue(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, status: 'Arrived' } : t))
    );
    // Update user tokens if it's in there
    setUserTokens(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, status: 'Arrived' } : t))
    );
    // Simulate push notification in-app
    setPendingNotification({
      tokenId: token.id,
      tokenNo: token.tokenNo,
      department: token.department || 'GP',
    });

    // Trigger external reminders (SMS/WhatsApp)
    ReminderService.sendLeaveNowReminder(token);
  }, [portalQueue]);

  const markServed = useCallback((tokenId: string) => {
    setPortalQueue(prev => {
      const token = prev.find(t => t.id === tokenId);
      if (token) {
        fireN8nEvent('patient_served', { ...token, status: 'Completed' });
      }
      return prev.map(t => (t.id === tokenId ? { ...t, status: 'Completed' } : t));
    });
    setUserTokens(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, status: 'Completed' } : t))
    );
  }, [fireN8nEvent]);

  const advanceQueue = useCallback((tokenId: string) => {
    setPortalQueue(prev =>
      prev.map(t =>
        t.id === tokenId
          ? { ...t, position: Math.max(1, (t.position || 1) - 1), waitTimeMinutes: Math.max(0, t.waitTimeMinutes - 10) }
          : t
      )
    );
  }, []);

  const clearNotification = useCallback(() => {
    setPendingNotification(null);
  }, []);

  const addFollowUpResponse = useCallback((response: FollowUpResponse) => {
    setFollowUpResponses(prev => [response, ...prev]);
    // Update token's followUpStatus
    const status = response.escalated ? 'Escalated' : 'Submitted';
    setUserTokens(prev => prev.map(t => t.id === response.tokenId ? { ...t, followUpStatus: status } : t));
    setPortalQueue(prev => prev.map(t => t.id === response.tokenId ? { ...t, followUpStatus: status } : t));
  }, []);

  const toggleAiPriority = useCallback(() => {
    setAiQueuePriority(prev => !prev);
    toast.info('AI Queue Priority ' + (aiQueuePriority ? 'disabled' : 'enabled'));
  }, [aiQueuePriority]);

  return (
    <AppStateContext.Provider
      value={{
        userTokens,
        addToken,
        updateTokenStatus,
        notificationsEnabled,
        setNotificationsEnabled,
        isOffline,
        familyMembers,
        currentPatientId,
        setCurrentPatientId,
        addFamilyMember,
        activeEmergency,
        startEmergency,
        stopEmergency,
        activeJourney,
        startJourney,
        stopJourney,
        portalAlerts,
        portalQueue,
        acceptAlert,
        declineAlert,
        markFalseAlarm,
        notifyPatient,
        markServed,
        advanceQueue,
        pendingNotification,
        clearNotification,
        userRole,
        login,
        logout,
        wellnessLogs,
        addWellnessLog,
        communityAlerts,
        createReferral,
        followUpResponses,
        addFollowUpResponse,
        aiQueuePriority,
        toggleAiPriority,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be within AppStateProvider');
  return ctx;
};
