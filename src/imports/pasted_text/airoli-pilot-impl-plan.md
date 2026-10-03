Airoli Pilot App - Implementation Plan

Overview

Build a demo-mode web application with both user-facing emergency/appointment flows and a hospital staff portal. This is a UI mockup with mock data and local state (no real APIs).

Scope





User App: Emergency alert + appointment queue flows



Hospital Portal: Staff dashboard for managing emergencies and queues



Language Support: Marathi/Hindi/English selector



Platform: Responsive React web app (desktop + mobile friendly)



Data: Mock/local state only (no backend integration yet)



Implementation Strategy

1. Architecture & Routing





Main routes:





/ - Language selection splash screen



/home - User home dashboard



/emergency - Emergency consent modal + nearby hospitals



/emergency-active - Live location sharing screen



/appointments - Book appointment or walk-in



/token - View token/queue status



/portal - Hospital portal landing/login



/portal/dashboard - Staff dashboard (emergencies + queue)



Route structure: Use React Router v6 to separate user app and portal sections



Shared layout: Global header with navigation context

2. UI/Branding Decisions





Color Scheme:





Primary: Emergency red accent (#EF4444) for critical actions



Secondary: Professional blue/teal for appointments and portal



Neutral grays for supporting UI



Update tailwind.config.ts and client/global.css with new theme tokens



Typography: Keep Inter font, ensure mobile legibility



Components:





Use existing shadcn/ui components where applicable (Button, Card, Dialog, Badge, etc.)



Create new components: HospitalCard, TokenCard, QueueList, LocationMap placeholder



Maintain design consistency across user app and portal

3. Page-by-Page Breakdown

Phase 1: Core User App Pages (Priority)





Splash/Language Selection (/)





Language buttons: Marathi, Hindi, English



Sets context/localStorage for language



Navigates to /home



Home Dashboard (/home)





Prominent red Emergency button



Quick links: Appointments, My Tokens, Settings



Recent tokens/status badges



Mock user profile section



Emergency Consent Modal (/emergency)





Language-specific consent text (Marathi/Hindi/English)



Checkbox agreement + Agree button



Navigates to nearby hospitals list after consent



Back button to home



Nearby Hospitals (/emergency - after consent)





Map placeholder (or simple visual indicator)



Hospital list with rating, ETA, phone



Sort by ETA (ascending)



"Send to Nearest" button + individual select buttons



Navigates to live emergency screen



Live Emergency Screen (/emergency-active)





Header: Hospital name, ETA countdown



Animated location indicator (simple moving dot simulation)



Map preview with live location



Contact buttons (Call hospital, Call ambulance)



Cancel button with 30s confirmation dialog



Status updates (e.g., "Hospital notified", "ETA: 8 minutes")

Phase 2: Appointment Pages





Appointments (/appointments)





Hospital search/filter



Department selection dropdown



Two options: Book slot (calendar) or Walk-in token



Shows mock available slots



Booking form



Token & Queue Status (/token)





Token card display (e.g., "A-23")



Position in queue (e.g., "You are #5")



Estimated wait time with countdown



Hospital details, directions link



"Leave Now" CTA (when notified)

Phase 3: Hospital Portal





Portal Login (/portal)





Email/password (demo mode - no validation)



2FA toggle label (optional for demo)



Routes to /portal/dashboard



Staff Dashboard (/portal/dashboard)





Two main panels:





Emergencies Panel: List of incoming emergency alerts with:





Patient phone, hospital ETA, alert time



Map preview of last known location



Accept/Decline/False Alarm buttons



Queue Panel: List of tokens by department with:





Token number, position, wait time



Patient phone



Notify button (triggers mock push notification toast)



Audit log or activity history section



Staff management link (placeholder)

4. State Management





Use React Context + local state for language selection



Use React hooks (useState) for modals, form data, navigation state



Mock data stored in constants (hospitals, tokens, emergencies, etc.)



localStorage for session simulation

5. Mock Data Structure





Hospitals: Array of 10-15 nearby hospitals with name, lat/lng, rating, ETA, phone



Emergency Sessions: List of active sessions with patient, hospital, start time, location



Tokens: Sample tokens with patient phone, position, wait time, status



Staff Users: Demo staff accounts

6. Key Components to Build





LanguageSelector - Splash screen



HomeScreen - Dashboard



ConsentModal - Emergency consent



HospitalList - Nearby hospitals with cards



LiveEmergencyScreen - Location sharing with animation



AppointmentForm - Booking flow



TokenCard - Queue status display



PortalLogin - Staff authentication



EmergenciesPanel - Staff incoming alerts



QueuePanel - Staff queue management



NotificationToast - Mock push notification display

7. Styling & Theme Updates





Create new color tokens for emergency red, hospital blue, success green



Define button variants: Emergency (red, large), Primary, Secondary, Danger



Responsive spacing: mobile-first design



Update tailwind.config.ts with custom theme



Global fonts and text hierarchy in client/global.css

8. Multilingual Support





Create constants/translations.ts with Marathi/Hindi/English text



Store selected language in Context



All UI text pulls from translations object based on selected language



Consent text matches spec exactly (English, Marathi, Hindi)

9. File Structure

client/
├── pages/
│   ├── Index.tsx (Language Splash)
│   ├── Home.tsx (User Home)
│   ├── Emergency.tsx (Emergency Flow)
│   ├── EmergencyActive.tsx (Live Tracking)
│   ├── Appointments.tsx (Appointment Booking)
│   ├── Token.tsx (Queue Status)
│   ├── PortalLogin.tsx (Staff Login)
│   └── PortalDashboard.tsx (Staff Dashboard)
├── components/
│   ├── HospitalCard.tsx
│   ├── TokenCard.tsx
│   ├── ConsentModal.tsx
│   ├── LocationIndicator.tsx
│   ├── EmergenciesPanel.tsx
│   ├── QueuePanel.tsx
│   └── [other feature components]
├── contexts/
│   └── LanguageContext.tsx
├── constants/
│   ├── translations.ts
│   └── mockData.ts
├── hooks/
│   └── useLanguage.ts (if needed)
└── App.tsx (Updated routing)

10. Deliverables (Phase by Phase)





Phase 1: Home + Language selection + Emergency flow (UI only)



Phase 2: Appointment flow + Token display



Phase 3: Hospital Portal login + Dashboard

11. Design Principles





Mobile-first: Ensure all screens work great on mobile



Accessibility: Use semantic HTML, proper contrast, keyboard navigation



Performance: Keep mock data in constants, minimize re-renders



Consistency: Reuse UI components from library, maintain design language



Clarity: Clear CTAs, obvious navigation, error states visible

12. Future Extensions (Not in MVP)





Real location permission integration



Real backend APIs for hospitals, tokens, push notifications



Map integration (Google Maps SDK)



Firebase for real-time updates



SMS/WhatsApp fallback notifications



Real 2FA for portal



Next Steps





Update tailwind.config.ts with new Airoli brand colors



Create client/constants/translations.ts and mockData.ts



Create client/contexts/LanguageContext.tsx



Build pages in order: Splash → Home → Emergency → Appointments → Portal



Update client/App.tsx with all new routes



Test responsive design on mobile and desktop



Notes





This is a demo/mockup build with no real APIs



All data flows are simulated with local state



Design should be production-quality, functional, and visually cohesive



Language support is built into all screens from the start