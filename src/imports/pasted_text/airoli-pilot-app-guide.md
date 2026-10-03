### Summary
**Build the Airoli pilot app by implementing three core systems: Emergency Hospital Finder with live location sharing, Appointment Queue with staff‑triggered push notifications, and a minimal Hospital Portal.** Below is a step‑by‑step, developer‑ready guide covering product requirements, UX flows, technical architecture, API spec, database schema, security & privacy, hospital onboarding, testing, and launch operations.

---

### 1. Product requirements and success criteria
**Primary user problems**
- Rapidly locate nearest appropriate hospital after a road accident and share live location so care can begin sooner.  
- Let outpatients wait at home and be notified by hospital staff when their turn is imminent.

**MVP success criteria**
- User can send a one‑tap emergency alert that shares live location with a chosen hospital and/or ambulance.  
- App shows a ranked list of nearby hospitals with ETA and rating.  
- Users can book an appointment token; hospital staff can advance the queue and push a notification to the user.  
- Hospitals can see incoming patients and their ETA on a simple dashboard.  
- Consent is captured and logged for every live location share.

---

### 2. Core user flows (step‑by‑step)

#### Emergency Alert Flow
1. **Home screen** shows a prominent **Emergency** button.  
2. User taps **Emergency** → show **Consent modal** (language selection: Marathi/Hindi/English) explaining live location sharing, duration, and purpose. User taps **Agree**.  
3. App requests device location permission (foreground + background if needed).  
4. After consent, app captures current GPS and opens a **Nearby Hospitals** list (map + list) sorted by **ETA** (driving time) and **rating**.  
5. User selects a hospital or taps **Send to nearest**. App begins streaming live location to backend for a limited session (e.g., 30–60 minutes).  
6. Backend notifies the selected hospital via the Hospital Portal and optionally sends an SMS/WhatsApp to hospital emergency desk.  
7. App shows live ETA, ambulance call button, and a cancel button with a 30s confirmation window to avoid false alarms.

#### Appointment Queue Flow
1. User opens **Appointments** → selects hospital/department → picks available slot or takes a **walk‑in token**.  
2. Backend issues a **token number** and estimated wait time. App shows token and queue position.  
3. Hospital staff use the Portal to **advance** the queue. When a token is next, staff presses **Notify** which triggers a push notification to the user: **“Your token is being called — please leave home now.”**  
4. App receives push and shows a prominent **Leave Now** CTA and ETA to hospital. Optionally share live location automatically when user taps CTA.

#### Hospital Portal Flow
1. Staff login with role‑based access.  
2. Dashboard shows **incoming emergency alerts** (map, patient phone, ETA), **appointment queue** (tokens, wait times), and **ability to send push** or mark false alarms.  
3. Portal logs all staff actions for audit.

---

### 3. Technical architecture (components and responsibilities)

**High level**
- **Mobile app:** React Native (single codebase for Android + iOS).  
- **Backend API:** Node.js (Express) or Python (FastAPI).  
- **Database:** PostgreSQL for relational data; Redis for short‑lived queue state and caching.  
- **Realtime & Push:** Firebase Cloud Messaging (FCM) for push; Firebase Realtime Database or WebSocket (Socket.IO) for live location streaming and hospital portal updates.  
- **Maps & Places:** Google Maps SDK + Places API for hospital locations, driving ETA, and ratings.  
- **Hospital Portal:** React web app (hosted on same cloud) with secure staff authentication.  
- **Hosting:** AWS/GCP/Azure (managed DB, load balancer, HTTPS).  
- **SMS/WhatsApp fallback:** Twilio or local SMS gateway for critical alerts.

**Component interactions**
- Mobile app ↔ Backend REST API for bookings, tokens, consent logging.  
- Mobile app ↔ Firebase/Socket for live location streaming.  
- Backend ↔ Google Places for hospital list and ratings.  
- Hospital Portal ↔ Backend + Firebase for real‑time incoming alerts and push triggers.

---

### 4. API specification (essential endpoints)

> All endpoints use HTTPS and require authentication (JWT for users; staff tokens for portal).

#### Authentication
- `POST /api/auth/login` — login (phone OTP).  
- `POST /api/auth/verify-otp` — verify OTP, return JWT.

#### Emergency and location
- `POST /api/emergency/start`  
  **Request**
  ```json
  {
    "user_id":"uuid",
    "hospital_id":"string",
    "consent": true,
    "consent_text_id":"consent_v1",
    "note":"optional short note"
  }
  ```
  **Response**
  ```json
  { "session_id":"uuid", "expires_at":"ISO8601", "hospital_notified": true }
  ```
- `POST /api/emergency/location` — (called frequently while streaming)
  ```json
  { "session_id":"uuid", "lat":12.98, "lng":77.58, "speed":0.0, "timestamp":"ISO8601" }
  ```
  **Response**
  ```json
  { "ok": true }
  ```
- `POST /api/emergency/stop`
  ```json
  { "session_id":"uuid", "reason":"user_cancelled|arrived|false_alarm" }
  ```

#### Hospital list and ETA
- `GET /api/hospitals/nearby?lat=...&lng=...&radius=5000`  
  **Response**
  ```json
  [
    { "id":"h1", "name":"Airoli Hospital", "lat":..., "lng":..., "rating":4.2, "eta_minutes":8, "phone":"+91..." }
  ]
  ```

#### Appointments and queue
- `POST /api/appointments/book`
  ```json
  { "user_id":"uuid", "hospital_id":"h1", "department":"OPD", "type":"slot|walkin" }
  ```
  **Response**
  ```json
  { "token":"A-23", "position":5, "estimated_wait_minutes":60 }
  ```
- `POST /api/queue/advance` (staff only)
  ```json
  { "hospital_id":"h1", "department":"OPD", "next_token":"A-23" }
  ```
  **Effect:** triggers push to user(s) for that token.

#### Staff actions and audit
- `POST /api/staff/notify` — send push to specific token.  
- `GET /api/staff/incoming` — list of active emergency sessions and queued tokens.

---

### 5. Database schema (core tables)

**users**
- `id UUID PK`, `name`, `phone`, `language_pref`, `created_at`

**hospitals**
- `id`, `name`, `address`, `lat`, `lng`, `phone`, `rating_source`, `rating_value`, `verified`

**emergency_sessions**
- `id`, `user_id`, `hospital_id`, `consent_text_id`, `started_at`, `expires_at`, `status`

**locations_stream`** (short‑lived, purge after session)
- `id`, `session_id`, `lat`, `lng`, `timestamp`

**appointments**
- `id`, `user_id`, `hospital_id`, `department`, `token`, `status`, `created_at`, `position`

**staff_users**
- `id`, `hospital_id`, `name`, `role`, `auth_token`, `last_login`

**audit_logs**
- `id`, `actor_type` (user|staff), `actor_id`, `action`, `payload`, `timestamp`

---

### 6. Mobile UI screens and behavior (wireframe text)

1. **Splash / Language selection** — choose Marathi/Hindi/English.  
2. **Home** — Emergency button (red), Appointments, My Tokens, Settings.  
3. **Emergency Consent modal** — short consent text + checkbox + Agree.  
4. **Nearby Hospitals Map/List** — each item shows name, rating, ETA, call button, select button.  
5. **Live Emergency Screen** — map with moving dot, ETA, hospital contact, cancel button.  
6. **Appointments Screen** — book slot or take walk‑in token; shows token card with position and estimated wait.  
7. **Notification Screen** — when push arrives, show token details, Leave Now CTA, Share Live Location toggle.

---

### 7. Hospital Portal UI (minimal)

- **Login** (2FA optional).  
- **Dashboard**: two panels — **Emergencies** (list with map, patient phone, ETA, accept/decline) and **Queue** (tokens, position, notify button).  
- **Patient detail**: view last known location, call button, mark arrived/false alarm.  
- **Settings**: staff management, notification templates, consent text versioning.

---

### 8. Push notification and message templates
- **Emergency alert to hospital staff:** “Emergency alert: Patient near [area]. Tap to view location.”  
- **Appointment notify to user:** “Your token [A-23] is being called. Please leave now.”  
- **Cancel/False alarm:** “This alert has been cancelled by the user.”

---

### 9. Consent and privacy (exact text examples)

**English short consent**
> I consent to share my live location with the selected hospital and ambulance for emergency care. Location will be shared only for this session and deleted after it ends.

**Marathi short consent**
> मी आपत्कालीन उपचारासाठी माझे थेट स्थान निवडलेल्या रुग्णालयास आणि रुग्णवाहिकेला शेअर करण्यास संमती देतो/देते. सत्र संपल्यानंतर स्थान हटवले जाईल.

**Hindi short consent**
> मैं आपातकालीन उपचार के लिए अपना लाइव स्थान चुने गए अस्पताल और एम्बुलेंस के साथ साझा करने के लिए सहमति देता/देती हूँ। सत्र समाप्त होने पर स्थान हटाया जाएगा।

**Implementation**
- Show consent modal before any location is transmitted.  
- Store `consent_text_id`, `user_id`, `timestamp`, and device info in `audit_logs`.

---

### 10. Security, compliance and data retention
- **Transport:** TLS 1.2+ for all endpoints.  
- **Authentication:** OTP login for users; JWT tokens with short expiry. Staff accounts use stronger 2FA.  
- **Encryption:** encrypt PII at rest (phone numbers, names) using KMS.  
- **Retention:** delete live location stream after session expiry + keep minimal logs for 30–90 days per hospital MOU.  
- **Access control:** role‑based access for hospital staff; strict logging of who viewed location.  
- **False alarm mitigation:** require 2‑tap confirmation and 30s cancel window; hospital can mark false alarms and flag repeat offenders.

---

### 11. Testing checklist (manual + automated)
- **Unit tests** for backend endpoints and queue logic.  
- **Integration tests** for push notifications and Firebase streaming.  
- **E2E tests** simulating emergency flow: consent → location stream → hospital notification → staff accept.  
- **Load test** for queue advance and push bursts.  
- **Security tests**: pen test on auth, data access, and storage.  
- **Field test** with hospital staff and 20 pilot users in Airoli to validate ETA accuracy and staff workflows.

---

### 12. Hospital onboarding and operations (step‑by‑step)
1. **Identify target hospitals** in Airoli and Navi Mumbai (emergency hospitals, large clinics).  
2. **Prepare a one‑page pilot brief** describing benefits, data handling, and responsibilities.  
3. **Sign a simple MOU** covering consent, data retention, and staff responsibilities.  
4. **Train staff** (30–60 minute session) on Portal usage and SOP for incoming patients.  
5. **Run a dry run**: simulate 5 emergency alerts and 10 appointment notifications.  
6. **Collect feedback** and iterate UI/notification wording.  
7. **Go live** with public pilot and monitor KPIs.

---

### 13. Monitoring and KPIs to track
- **Median time from alert to hospital arrival** (primary).  
- **% of notifications delivered and opened**.  
- **False alarm rate**.  
- **Hospital acceptance rate** (how many alerts are acknowledged).  
- **User retention and repeat usage**.  
- **System uptime and push delivery latency**.

---

### 14. Operational safety and legal notes
- Always require explicit consent before sharing location.  
- Provide multilingual consent and clear cancellation flows.  
- Keep hospital ratings verified to avoid misleading users.  
- Consult a legal advisor for local health data regulations and MOUs with hospitals.

---

### 15. Minimal development checklist you can hand to engineers
- Project repo + CI setup.  
- Firebase project (Auth, Realtime/Firestore, FCM).  
- Google Cloud/Maps API key with billing enabled.  
- Backend skeleton (Auth, Emergency, Appointments, Hospitals).  
- PostgreSQL schema + Redis for queue.  
- React Native app skeleton with screens and location permission flows.  
- React hospital portal skeleton.  
- Automated tests and staging environment.  
- Monitoring (Sentry/Datadog) and logging.

---

### 16. Example code snippets and payloads

**Sample push payload (FCM)**
```json
{
  "to": "<fcm_token>",
  "notification": {
    "title": "Your token is being called",
    "body": "Token A-23 — please leave now"
  },
  "data": {
    "type": "token_notify",
    "token": "A-23",
    "hospital_id": "h1"
  }
}
```

**Sample location streaming (client pseudocode)**
```js
// start session -> receive session_id
setInterval(() => {
  fetch('/api/emergency/location', {
    method:'POST',
    headers:{Authorization:`Bearer ${jwt}`},
    body: JSON.stringify({session_id, lat, lng, timestamp: new Date().toISOString()})
  })
}, 5000); // every 5 seconds
```

---

### 17. Next practical steps for you (no timeline)
1. **Decide scope**: Emergency only, Appointments only, or both.  
2. **Get API keys**: Google Maps/Places and Firebase.  
3. **Identify 2–3 hospitals** in Airoli to pilot and prepare the one‑page brief and consent text.  
4. **Hire/assign** a small team: 1 mobile dev (React Native), 1 backend dev, 1 frontend dev (portal), 1 QA.  
5. **Start a repo** and implement the authentication + emergency consent + one‑tap emergency flow first.

---

If you want, I will now produce **(pick one)**:  
- **A full API reference** with all endpoints, request/response examples and error codes,  
- **A complete database migration script** (Postgres CREATE TABLE statements) for the schema above,  
- **React Native screen components** (JSX + navigation) for the Emergency and Appointment flows, or  
- **A short hospital outreach email and MOU template** in English and Marathi.

Tell me which of those to generate first and I’ll produce it immediately.