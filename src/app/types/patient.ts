export interface PatientProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  relationship: 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Other';
  bloodGroup: string;
  abhaId?: string;
  dob?: string;
}

export interface DeviceProfile {
  deviceProfileId: string;
  displayName: string;
}

export const MOCK_FAMILY_MEMBERS: PatientProfile[] = [
  {
    id: 'p_1',
    name: 'Rohan (Self)',
    avatar: '👨',
    phone: '+91 98765 43210',
    email: 'rohan@example.com',
    relationship: 'Self',
    bloodGroup: 'O+',
  },
  {
    id: 'p_2',
    name: 'Anjali (Spouse)',
    avatar: '👩',
    phone: '+91 98765 43211',
    email: 'anjali@example.com',
    relationship: 'Spouse',
    bloodGroup: 'B+',
  },
  {
    id: 'p_3',
    name: 'Aarav (Child)',
    avatar: '👦',
    phone: '+91 98765 43210',
    email: '',
    relationship: 'Child',
    bloodGroup: 'O+',
  }
];
