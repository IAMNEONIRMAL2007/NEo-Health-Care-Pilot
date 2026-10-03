export interface PartnerPharmacy {
  id: string;
  name: string;
  distance: string;
  rating: number;
  open: boolean;
  stockLevel: 'High' | 'Medium' | 'Low';
  phone: string;
  address: string;
}

export const MOCK_PHARMACIES: PartnerPharmacy[] = [
  {
    id: 'ph1',
    name: 'Airoli Medicos (24/7)',
    distance: '0.4 km',
    rating: 4.8,
    open: true,
    stockLevel: 'High',
    phone: '+91 22 2768 0001',
    address: 'Sector 8, Near NMMC Hospital, Airoli'
  },
  {
    id: 'ph2',
    name: 'Apollo Pharmacy Airoli',
    distance: '1.2 km',
    rating: 4.5,
    open: true,
    stockLevel: 'Medium',
    phone: '+91 22 2768 0002',
    address: 'Sector 15, Near Railway Station, Airoli'
  },
  {
    id: 'ph3',
    name: 'Wellness Forever',
    distance: '1.8 km',
    rating: 4.7,
    open: true,
    stockLevel: 'High',
    phone: '+91 22 2768 0003',
    address: 'Sector 19, Airoli Market'
  },
  {
    id: 'ph4',
    name: 'City Care Chemist',
    distance: '2.5 km',
    rating: 4.2,
    open: false,
    stockLevel: 'Low',
    phone: '+91 22 2768 0004',
    address: 'Sector 3, Airoli'
  }
];

export interface PartnerLab {
  id: string;
  name: string;
  distance: string;
  rating: number;
  availableSlots: string[];
  homeCollection: boolean;
}

export const MOCK_LABS: PartnerLab[] = [
  {
    id: 'lab1',
    name: 'Metropolis Healthcare',
    distance: '0.8 km',
    rating: 4.9,
    availableSlots: ['08:00 AM', '09:00 AM', '10:30 AM'],
    homeCollection: true
  },
  {
    id: 'lab2',
    name: 'Thyrocare Airoli',
    distance: '1.5 km',
    rating: 4.6,
    availableSlots: ['07:30 AM', '08:30 AM', '11:00 AM'],
    homeCollection: true
  }
];
