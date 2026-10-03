### End‑to‑end app flows in strict step order

Below are **clear, linear step sequences** for every user and staff path in the app. Each line is a single step you can map to a screen or API call. Use these as the canonical navigation and event order when wiring your mock to real services.

---

### Home to Emergency to Ambulance
- **Home** → user sees primary actions: **Emergency**, **Appointments**, **My Tokens**, **Help**.  
- **Emergency tap** → show **Language selection** if first time; then show **Consent screen** (short multilingual text).  
- **Consent accept** → request device **location permission**; show a 5–30 second **confirmation countdown** with Cancel.  
- **Countdown completes** → call `start session` on backend; return `session_id` and `expires_at`.  
- **Show Nearby Hospitals** (map + list) sorted by **ETA and verified status**; highlight **Send to nearest** and **Call ambulance** buttons.  
- **User selects hospital** or taps **Send to nearest** → app begins **live location streaming** to backend and shows live map with ETA and hospital contact.  
- **User taps Call ambulance** → app dials ambulance number or sends structured SMS/WhatsApp to ambulance provider and shows “Ambulance requested” confirmation.  
- **Backend notifies hospital portal** (incoming emergency event) and optionally sends SMS fallback to hospital emergency desk.  
- **Hospital acknowledges** in portal → portal shows ETA and moving dot; staff can mark accepted.  
- **User arrives or cancels** → app calls `stop session` with reason `arrived|cancelled|false_alarm`; backend logs and purges location after retention window.

**Checklist for this flow**
- Log consent with `consent_text_id`, timestamp, device id.  
- Retry location sends on transient failures; show connection health.  
- Provide 30s cancel window to reduce false alarms.  
- SMS fallback for ambulance/hospital if push fails.

---

### Home to Appointments to Leave Now notification
- **Home** → user taps **Appointments**.  
- **Select hospital and department** → show available slots and a **Walk‑in token** option.  
- **Book slot or take token** → backend issues **token** and returns `position` and `estimated_wait`.  
- **Token screen** → show token card, current position, estimated wait, and option **Share ETA**.  
- **Hospital staff advances queue** in portal → staff presses **Notify** for the token.  
- **Backend sends push** (and SMS fallback) to the user: **“Token A‑23 is being called — please leave now.”**  
- **User receives notification** → tap opens app to token screen with **Leave Now** CTA and option to **auto‑share live location**.  
- **User taps Leave Now** → app optionally starts a short live session and shows ETA to hospital; backend logs start.  
- **User arrives** → staff marks token served; backend updates token status to `completed`.

**Checklist for this flow**
- Ensure push contains `data` payload with token and hospital id for deep linking.  
- Allow user to decline auto‑share and still navigate to hospital.  
- Show clear fallback instructions if push not delivered.

---

### Hospital Portal linear flow
- **Portal login** → staff authenticates with role and hospital scope.  
- **Dashboard** → two panels: **Incoming Emergencies** and **Appointment Queue**.  
- **Incoming emergency appears** → staff sees patient phone, last known location, ETA, and Accept/Decline buttons.  
- **Staff Accepts** → portal emits acknowledgement to backend and optionally triggers SMS to ambulance.  
- **Queue management** → staff advances tokens and presses **Notify** to send push/SMS to patient.  
- **View patient detail** → staff can call patient, view live map, mark `arrived` or `false_alarm`, and add notes.  
- **Audit log** → every view and action is recorded with staff id and timestamp.

**Checklist for portal**
- Keep UI one screen per task to minimize training.  
- Provide prewritten notification templates in Marathi/Hindi/English.  
- Show connection and push delivery status for each notification.

---

### Settings, Onboarding, and Help
- **Onboarding** (first open) → two micro‑slides: why location is needed and how consent works; then language selection.  
- **Settings** → manage language, notification preferences, view consent history, and delete account request.  
- **Help** → quick SOPs: what to do in an accident, how to cancel an alert, hospital contact list, and FAQ.  
- **Support contact** → one‑tap call or message to pilot support; include escalation contact for hospitals.

**Checklist**
- Persist language preference and show localized strings everywhere.  
- Provide a visible “Cancel alert” and “Report false alarm” in both app and portal.

---

### Error handling and fallback sequence
- **Permission denied** → show clear instructions to enable location in settings and offer manual entry of location or nearest landmark.  
- **Network failure while streaming** → queue location updates locally and retry; show “Offline, will sync” status.  
- **Push delivery failure** → attempt SMS/WhatsApp fallback and log delivery attempts.  
- **Ambulance unavailable** → show nearest alternate hospitals and provide manual call numbers.

**Checklist**
- Show user‑facing, non‑technical error messages and next steps.  
- Log all failures for post‑pilot analysis.

---

### Notification and message templates
- **Emergency to hospital staff**: “Emergency alert: Patient near [area]. Tap to view location.”  
- **Appointment notify to user**: “Your token A‑23 is being called. Please leave now.”  
- **False alarm cancel**: “This alert has been cancelled by the user.”  
- **Ambulance requested**: “Ambulance requested for patient near [area]. ETA [mins].”

---

Use these ordered sequences as the single source of truth when mapping screens, API endpoints, and portal actions. Each step corresponds to a screen or backend event; implement them in this exact order to ensure predictable behavior for users and hospital staff.