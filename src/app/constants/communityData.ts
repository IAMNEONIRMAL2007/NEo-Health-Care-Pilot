export interface CommunityAlert {
  id: string;
  type: 'Weather' | 'Health' | 'Outbreak' | 'Community';
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: string;
  tags: string[];
  date: string;
}

export const MOCK_COMMUNITY_ALERTS: CommunityAlert[] = [
  {
    id: 'ca1',
    type: 'Weather',
    severity: 'High',
    title: 'Monsoon Preparedness',
    message: 'Navi Mumbai is expecting heavy rains this week. Ensure children are vaccinated against typhoid and avoid eating street food.',
    actionLabel: 'View Checklist',
    tags: ['Safety', 'Monsoon'],
    date: '2026-06-15'
  },
  {
    id: 'ca2',
    type: 'Health',
    severity: 'Medium',
    title: 'Heatwave Alert',
    message: 'High temperatures predicted in Airoli Sector 10. Stay hydrated and avoid outdoor activity between 12 PM and 4 PM.',
    actionLabel: 'Hydration Tips',
    tags: ['Weather', 'Planning'],
    date: '2026-04-22'
  },
  {
    id: 'ca3',
    type: 'Outbreak',
    severity: 'Medium',
    title: 'Spike in Viral Fever',
    message: 'Local clinics report an increase in viral infections in Sector 15. If showing symptoms, use the AI Triage Assistant before visiting.',
    actionLabel: 'Start Triage',
    actionLink: '/appointments',
    tags: ['Outbreak', 'Advisory'],
    date: '2026-04-20'
  }
];

export interface LocalResource {
  name: string;
  type: 'Ambulance' | 'Blood Bank' | 'Pharmacy';
  phone: string;
  address: string;
}

export const AIROLI_RESOURCES: LocalResource[] = [
  {
    name: 'NMMC Ambulance Service',
    type: 'Ambulance',
    phone: '108',
    address: 'Sector 3, Airoli'
  },
  {
    name: 'LifeCare Blood Bank',
    type: 'Blood Bank',
    phone: '+91 22 2768 1122',
    address: 'Sector 8, Airoli'
  }
];
