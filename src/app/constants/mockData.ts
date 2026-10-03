import { Token } from '../types/token';

export type Hospital = {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  eta: number; // minutes
  distance: string; // km
  phone: string;
  address: string;
  emergency: boolean;
  departments: string[];
  verified: boolean;
  beds: number;
  ambulance: boolean;
};

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'NMMC Hospital Airoli',
    shortName: 'NMMC Airoli',
    lat: 19.1497,
    lng: 72.9974,
    rating: 4.6,
    reviewCount: 832,
    eta: 5,
    distance: '1.2',
    phone: '+912227688000',
    address: 'Sector 8, Airoli, Navi Mumbai 400708',
    emergency: true,
    departments: ['General Physician', 'Orthopedics', 'Pediatrics', 'Cardiology', 'ENT', 'Gynecology'],
    verified: true,
    beds: 200,
    ambulance: true,
  },
  {
    id: 'h2',
    name: 'Lifeline Multi-Specialty Hospital',
    shortName: 'Lifeline Hospital',
    lat: 19.1563,
    lng: 73.0031,
    rating: 4.4,
    reviewCount: 524,
    eta: 8,
    distance: '2.4',
    phone: '+912227661234',
    address: 'Sector 15, Airoli, Navi Mumbai 400708',
    emergency: true,
    departments: ['General Physician', 'Pediatrics', 'Orthopedics', 'Neurology', 'Dermatology'],
    verified: true,
    beds: 150,
    ambulance: true,
  },
  {
    id: 'h3',
    name: 'Thane Civil Hospital',
    shortName: 'Thane Civil',
    lat: 19.1400,
    lng: 72.9800,
    rating: 4.1,
    reviewCount: 1204,
    eta: 12,
    distance: '3.8',
    phone: '+912225342181',
    address: 'Sector 5, Kopar Khairane, Navi Mumbai 400709',
    emergency: true,
    departments: ['General Physician', 'Surgery', 'Pediatrics', 'Orthopedics', 'Ophthalmology', 'ENT'],
    verified: true,
    beds: 500,
    ambulance: true,
  },
  {
    id: 'h4',
    name: 'Sunrise Care Clinic',
    shortName: 'Sunrise Clinic',
    lat: 19.1553,
    lng: 72.9955,
    rating: 4.0,
    reviewCount: 189,
    eta: 15,
    distance: '4.5',
    phone: '+919821001234',
    address: 'Sector 19, Airoli, Navi Mumbai 400708',
    emergency: false,
    departments: ['General Physician', 'Pediatrics', 'Gynecology', 'Dermatology'],
    verified: true,
    beds: 40,
    ambulance: false,
  },
  {
    id: 'h5',
    name: 'MGM Hospital Vashi',
    shortName: 'MGM Vashi',
    lat: 19.0725,
    lng: 73.0125,
    rating: 4.7,
    reviewCount: 2103,
    eta: 22,
    distance: '8.1',
    phone: '+912227564900',
    address: 'Sector 1A, Vashi, Navi Mumbai 400703',
    emergency: true,
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Nephrology', 'General Physician', 'Gynecology'],
    verified: true,
    beds: 750,
    ambulance: true,
  },
];

export const AMBULANCE_NUMBER = '108';
export const PILOT_SUPPORT_NUMBER = '+919022334455';

export type Doctor = {
  id: string;
  name: string;
  department: string;
  hospitalId: string;
  qualification: string;
  experience: number;
};

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Priya Sharma', department: 'General Physician', hospitalId: 'h1', qualification: 'MBBS, MD', experience: 12 },
  { id: 'd2', name: 'Dr. Rajan Mehta', department: 'Orthopedics', hospitalId: 'h1', qualification: 'MS Ortho', experience: 18 },
  { id: 'd3', name: 'Dr. Anita Desai', department: 'Pediatrics', hospitalId: 'h1', qualification: 'MBBS, DCH', experience: 9 },
  { id: 'd4', name: 'Dr. Suresh Nair', department: 'Cardiology', hospitalId: 'h1', qualification: 'DM Cardiology', experience: 22 },
  { id: 'd5', name: 'Dr. Kavita Kulkarni', department: 'General Physician', hospitalId: 'h2', qualification: 'MBBS, MD', experience: 8 },
  { id: 'd6', name: 'Dr. Vikram Patil', department: 'Pediatrics', hospitalId: 'h2', qualification: 'MD Pediatrics', experience: 15 },
  { id: 'd7', name: 'Dr. Sunita Joshi', department: 'Gynecology', hospitalId: 'h1', qualification: 'MS OBG', experience: 14 },
  { id: 'd8', name: 'Dr. Amit Rane', department: 'ENT', hospitalId: 'h1', qualification: 'MS ENT', experience: 11 },
];

export type Slot = {
  time: string;
  available: boolean;
  period: 'morning' | 'afternoon' | 'evening';
};

export const generateSlots = (): Slot[] => [
  { time: '09:00 AM', available: false, period: 'morning' },
  { time: '09:30 AM', available: true, period: 'morning' },
  { time: '10:00 AM', available: true, period: 'morning' },
  { time: '10:30 AM', available: false, period: 'morning' },
  { time: '11:00 AM', available: true, period: 'morning' },
  { time: '11:30 AM', available: true, period: 'morning' },
  { time: '02:00 PM', available: true, period: 'afternoon' },
  { time: '02:30 PM', available: false, period: 'afternoon' },
  { time: '03:00 PM', available: true, period: 'afternoon' },
  { time: '04:00 PM', available: true, period: 'afternoon' },
  { time: '04:30 PM', available: true, period: 'afternoon' },
  { time: '06:00 PM', available: true, period: 'evening' },
  { time: '06:30 PM', available: false, period: 'evening' },
];

export type EmergencyAlert = {
  id: string;
  patientPhone: string;
  patientName: string;
  hospitalId: string;
  eta: number;
  area: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
  lat: number;
  lng: number;
  note?: string;
};

export const MOCK_EMERGENCIES: EmergencyAlert[] = [
  {
    id: 'e1',
    patientPhone: '+91 99999 00001',
    patientName: 'Unknown Patient',
    hospitalId: 'h1',
    eta: 4,
    area: 'Sector 6, Airoli',
    status: 'pending',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    lat: 19.1480,
    lng: 72.9950,
    note: 'Road accident near Airoli bridge',
  },
  {
    id: 'e2',
    patientPhone: '+91 98765 43210',
    patientName: 'Unknown Patient',
    hospitalId: 'h1',
    eta: 10,
    area: 'Ghansoli Road',
    status: 'pending',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    lat: 19.1520,
    lng: 73.0010,
    note: 'Chest pain reported',
  },
];

export const MOCK_TOKENS: Token[] = [
  {
    id: 't1',
    clinicId: 'h1',
    hospitalName: 'NMMC Hospital Airoli',
    department: 'General Physician',
    doctorName: 'Dr. Priya Sharma',
    doctorId: 'd1',
    tokenNo: 'A-12',
    position: 2,
    totalInQueue: 14,
    waitTimeMinutes: 15,
    status: 'Booked',
    patientName: 'Rohan Deshmukh',
    phone: '+91 88888 00001',
    age: 25,
    bookedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    type: 'slot',
    appointmentTime: '11:00 AM',
    paymentMethod: 'Online',
    paymentStatus: 'Success',
    remindersSent: { sms: true, email: true, whatsapp: true },
    noShowRisk: 'Low'
  },
  {
    id: 't2',
    clinicId: 'h1',
    hospitalName: 'NMMC Hospital Airoli',
    department: 'Orthopedics',
    doctorName: 'Dr. Rajan Mehta',
    doctorId: 'd2',
    tokenNo: 'B-04',
    position: 1,
    totalInQueue: 8,
    waitTimeMinutes: 5,
    status: 'Booked',
    patientName: 'Aditya Gupta',
    phone: '+91 88888 00002',
    age: 45,
    bookedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'walkin',
    appointmentTime: 'Walk-in',
    paymentMethod: 'Cash',
    paymentStatus: 'PayAtClinic',
    remindersSent: { sms: false, email: false, whatsapp: false },
    noShowRisk: 'Medium'
  },
  {
    id: 't3',
    clinicId: 'h1',
    hospitalName: 'NMMC Hospital Airoli',
    department: 'Pediatrics',
    doctorName: 'Dr. Anita Desai',
    doctorId: 'd3',
    tokenNo: 'C-08',
    position: 4,
    totalInQueue: 11,
    waitTimeMinutes: 35,
    status: 'Booked',
    patientName: 'Suresh Kumar',
    phone: '+91 88888 00003',
    age: 32,
    bookedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'slot',
    appointmentTime: '02:00 PM',
    paymentStatus: 'Pending',
    remindersSent: { sms: true, email: false, whatsapp: true },
    noShowRisk: 'Low'
  },
  {
    id: 't4',
    clinicId: 'h2',
    hospitalName: 'Lifeline Multi-Specialty Hospital',
    department: 'Cardiology',
    doctorName: 'Dr. Suresh Nair',
    doctorId: 'd4',
    tokenNo: 'D-02',
    position: 2,
    totalInQueue: 6,
    waitTimeMinutes: 20,
    status: 'Booked',
    patientName: 'Meena Sharma',
    phone: '+91 88888 00004',
    age: 60,
    bookedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    type: 'slot',
    appointmentTime: '03:00 PM',
    paymentStatus: 'Pending',
    remindersSent: { sms: false, email: false, whatsapp: false },
    noShowRisk: 'High'
  },
];

export type ActivityItem = {
  id: string;
  type: 'appointment' | 'emergency' | 'token';
  title: string;
  subtitle: string;
  status: 'completed' | 'cancelled' | 'missed';
  date: string;
};

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'act1',
    type: 'appointment',
    title: 'Dr. Priya Sharma',
    subtitle: 'General Physician • NMMC Hospital',
    status: 'completed',
    date: 'Today, 9:30 AM',
  },
  {
    id: 'act2',
    type: 'appointment',
    title: 'Dr. Rajan Mehta',
    subtitle: 'Orthopedics • NMMC Hospital',
    status: 'completed',
    date: 'Yesterday, 11:00 AM',
  },
  {
    id: 'act3',
    type: 'emergency',
    title: 'Emergency Alert',
    subtitle: 'Location shared with NMMC Hospital',
    status: 'completed',
    date: '2 days ago',
  },
  {
    id: 'act4',
    type: 'token',
    title: 'Walk-in Token B-14',
    subtitle: 'Pediatrics • Lifeline Hospital',
    status: 'missed',
    date: '3 days ago',
  },
];

export const FAQ_ITEMS = [
  {
    q: 'What happens to my location data?',
    a: 'Your location is shared only during the emergency session and is automatically deleted once the session ends. We store only a minimal log for audit purposes.',
  },
  {
    q: 'How do I cancel an emergency alert?',
    a: 'Tap "Cancel Alert" on the active emergency screen. You will see a 30-second confirmation window to prevent false alarms. Tap "Yes, Cancel" to stop sharing.',
  },
  {
    q: 'Can I book for a family member?',
    a: 'Yes. Use the Appointments screen and enter the patient details. The token will be linked to your account.',
  },
  {
    q: 'What if I miss my token?',
    a: 'Contact the hospital reception directly. You can find the number on your Token card. Staff can requeue you depending on availability.',
  },
  {
    q: 'Which hospitals are available?',
    a: 'We have partnered with 5 hospitals in the Airoli-Navi Mumbai area. The list includes NMMC Hospital Airoli, Lifeline Hospital, Thane Civil Hospital, Sunrise Clinic, and MGM Vashi.',
  },
];

// ── Hospital Reviews ──
export type Review = {
  id: string;
  hospitalId: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  tags: string[];
};

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', hospitalId: 'h1', name: 'Sneha Patil', rating: 5, date: '3 days ago', text: 'Very clean facilities and the staff was extremely polite. Dr. Priya spent ample time explaining my condition.', tags: ['Clean Facility', 'Polite Staff'] },
  { id: 'r2', hospitalId: 'h1', name: 'Arun Joshi', rating: 4, date: '1 week ago', text: 'Good experience overall. The token system made waiting much easier. Only downside was parking.', tags: ['Short Wait', 'Good Doctor'] },
  { id: 'r3', hospitalId: 'h1', name: 'Meera Kulkarni', rating: 5, date: '2 weeks ago', text: 'Emergency response was incredibly fast. The app notification feature is a game changer!', tags: ['Fast Response', 'Good Doctor'] },
  { id: 'r4', hospitalId: 'h2', name: 'Vikram Rao', rating: 4, date: '4 days ago', text: 'Dr. Kavita is very experienced. The hospital could use more seating in the waiting area.', tags: ['Good Doctor', 'Polite Staff'] },
  { id: 'r5', hospitalId: 'h2', name: 'Priya Sharma', rating: 5, date: '1 week ago', text: 'Best pediatric care for my child. The staff went above and beyond.', tags: ['Clean Facility', 'Polite Staff', 'Good Doctor'] },
  { id: 'r6', hospitalId: 'h3', name: 'Rajiv Deshmukh', rating: 3, date: '5 days ago', text: 'Wait time was longer than expected but the doctor was thorough. Good treatment overall.', tags: ['Good Doctor'] },
];

// ── Prescriptions ──
export type Prescription = {
  id: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  date: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; duration: string; timing: string }[];
  notes?: string;
};

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx1', doctorName: 'Dr. Priya Sharma', hospitalName: 'NMMC Hospital Airoli', department: 'General Physician',
    date: 'Today, 9:30 AM', diagnosis: 'Upper Respiratory Infection',
    medicines: [
      { name: 'Azithromycin 500mg', dosage: '1 tablet', duration: '3 days', timing: 'After breakfast' },
      { name: 'Cetirizine 10mg', dosage: '1 tablet', duration: '5 days', timing: 'Before bed' },
      { name: 'Paracetamol 650mg', dosage: '1 tablet SOS', duration: 'As needed', timing: 'If fever > 100°F' },
    ],
    notes: 'Drink warm fluids. Avoid cold beverages. Follow up in 5 days if symptoms persist.',
  },
  {
    id: 'rx2', doctorName: 'Dr. Rajan Mehta', hospitalName: 'NMMC Hospital Airoli', department: 'Orthopedics',
    date: 'Yesterday, 11:00 AM', diagnosis: 'Mild Lumbar Strain',
    medicines: [
      { name: 'Diclofenac 50mg', dosage: '1 tablet', duration: '5 days', timing: 'After meals, twice daily' },
      { name: 'Thiocolchicoside 4mg', dosage: '1 capsule', duration: '5 days', timing: 'Twice daily' },
    ],
    notes: 'Apply hot water bag on lower back. Avoid lifting heavy objects for 2 weeks.',
  },
  {
    id: 'rx3', doctorName: 'Dr. Suresh Nair', hospitalName: 'NMMC Hospital Airoli', department: 'Cardiology',
    date: '5 days ago', diagnosis: 'Routine Cardiac Checkup',
    medicines: [
      { name: 'Ecosprin 75mg', dosage: '1 tablet', duration: 'Continue daily', timing: 'After dinner' },
      { name: 'Rosuvastatin 10mg', dosage: '1 tablet', duration: 'Continue daily', timing: 'Before bed' },
    ],
    notes: 'Lipid profile and ECG within 3 months. Maintain daily walk of 30 min.',
  },
];

// ── Lab Reports ──
export type LabReport = {
  id: string;
  testName: string;
  hospitalName: string;
  date: string;
  result: 'Normal' | 'Abnormal' | 'Borderline';
  values?: { parameter: string; value: string; range: string; status: 'normal' | 'high' | 'low' }[];
};

export const MOCK_REPORTS: LabReport[] = [
  {
    id: 'lab1', testName: 'Complete Blood Count (CBC)', hospitalName: 'NMMC Hospital Airoli',
    date: 'Today', result: 'Normal',
    values: [
      { parameter: 'Hemoglobin', value: '14.2 g/dL', range: '13.0–17.0', status: 'normal' },
      { parameter: 'WBC', value: '7,200 /µL', range: '4,500–11,000', status: 'normal' },
      { parameter: 'Platelets', value: '2.45 L/µL', range: '1.5–4.0', status: 'normal' },
    ],
  },
  {
    id: 'lab2', testName: 'Lipid Profile', hospitalName: 'NMMC Hospital Airoli',
    date: '1 week ago', result: 'Borderline',
    values: [
      { parameter: 'Total Cholesterol', value: '215 mg/dL', range: '< 200', status: 'high' },
      { parameter: 'LDL', value: '140 mg/dL', range: '< 130', status: 'high' },
      { parameter: 'HDL', value: '52 mg/dL', range: '> 40', status: 'normal' },
      { parameter: 'Triglycerides', value: '155 mg/dL', range: '< 150', status: 'high' },
    ],
  },
  {
    id: 'lab3', testName: 'Thyroid Profile (T3/T4/TSH)', hospitalName: 'Lifeline Hospital',
    date: '2 weeks ago', result: 'Normal',
    values: [
      { parameter: 'T3', value: '1.2 ng/mL', range: '0.8–2.0', status: 'normal' },
      { parameter: 'T4', value: '7.5 µg/dL', range: '5.1–14.1', status: 'normal' },
      { parameter: 'TSH', value: '2.8 mIU/L', range: '0.4–4.0', status: 'normal' },
    ],
  },
];

// ── Health Tips ──
export type HealthTip = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string; // tailwind bg class
  textColor: string;
};

export const MOCK_HEALTH_TIPS: HealthTip[] = [
  { id: 'tip1', emoji: '💧', title: 'Stay Hydrated', subtitle: 'Drink 8 glasses of water daily for optimal health', color: 'from-blue-500 to-cyan-500', textColor: 'text-white' },
  { id: 'tip2', emoji: '🏃', title: 'Walk 30 Minutes', subtitle: 'Daily walking reduces heart disease risk by 35%', color: 'from-green-500 to-emerald-500', textColor: 'text-white' },
  { id: 'tip3', emoji: '💉', title: 'Flu Vaccine Available', subtitle: 'Free flu vaccination camp at NMMC this weekend', color: 'from-purple-500 to-violet-500', textColor: 'text-white' },
  { id: 'tip4', emoji: '👁️', title: 'Free Eye Camp', subtitle: 'Free eye check-up at Lifeline Hospital — 20 Apr', color: 'from-amber-500 to-orange-500', textColor: 'text-white' },
  { id: 'tip5', emoji: '😴', title: 'Sleep 7-8 Hours', subtitle: 'Good sleep boosts immunity and mental clarity', color: 'from-indigo-500 to-blue-500', textColor: 'text-white' },
];

// ── User Profile ──
export const MOCK_USER_PROFILE = {
  name: 'Rohan Deshmukh',
  phone: '+91 98765 43999',
  email: 'rohan.deshmukh@gmail.com',
  aadhaar: 'XXXX XXXX 4523',
  avatar: 'RD',
  bloodGroup: 'B+',
  allergies: ['Penicillin', 'Dust'],
  emergencyContact: { name: 'Sunita Deshmukh', relation: 'Mother', phone: '+91 98765 43000' },
  stats: { totalVisits: 12, tokensUsed: 18, emergencyAlerts: 2 },
  dob: '15 Mar 1998',
  address: 'Flat 302, Sector 8, Airoli, Navi Mumbai 400708',
};
