# 📋 Airoli Care Connect – Production-Ready Backlog

This backlog translates the strategic roadmap into concrete **Epics** and **User Stories** for engineering and product teams.

***

## 🔴 Epic 1: Core Coordination & Reliability [Phase 1 – T1]  
**Value:** Establish trust and baseline utility for patients and clinics in Airoli.

- **ACC‑1: Smart Token Visualization**  
  - *As a patient, I want to see my live position and estimated wait time so I don’t waste time at the clinic.*  
  **Acceptance Criteria:**  
  - Live token counter and queue position on Token page.  
  - Color‑coded waiting statuses (e.g., red = “Being called”, green = “Next”).  
  - Clear distinction between “Arrived” and “Booked but not arrived”.

- **ACC‑2: SMS Fallback Protocol**  
  - *As a user with poor data coverage, I want to receive my critical token updates via SMS so I stay informed.*  
  **Acceptance Criteria:**  
  - Tokens / “you’re next” / change‑time notifications also sent via SMS when WebSocket/Push fails.  
  - Integration with SMS provider (Twilio‑style or local provider) + mock‑mode for dev/QA.

- **ACC‑3: Offline Queue Persistence**  
  - *As a patient at a clinic with poor Wi‑Fi, I want to view my current token number offline so I can show it to the receptionist.*  
  - **Dependency**: None.
  **Acceptance Criteria:**  
  - `activeTokens` cached in local storage / secure client‑side cache.  
  - “Sync pending” flag when offline changes conflict with server state.

- **ACC‑4: Family Profile Hub**  
  - *As a guardian, I want to manage my children’s and parents’ bookings from my account so I can coordinate family health.*  
  **Acceptance Criteria:**  
  - Profile switcher in the app header.  
  - Unified booking flow with a “Relation” selector (Self / Child / Spouse / Parent).  
  - Permission model: only the guardian can create/modify family tokens.

***

## 🟠 Epic 2: ABDM Health Stack Integration [Phase 1 – T1]  
**Value:** Regulatory compliance, ABHA‑based identity, and consent‑based record portability.

- **ACC‑5: ABHA ID Onboarding**  
  - *As a new user, I want to link my ABHA ID during registration so my records are automatically synced.*  
  **Acceptance Criteria:**  
  - Dedicated ABHA input field on sign‑up / profile screen.  
  - Mock API flow for ABHA verification.
  - User‑profile flag: `abhaLinked: true/false`.

- **ACC‑6: Consent‑Based Record Sharing**  
  - *As a patient, I want to control which doctors see my history so my data remains private.*  
  - **Dependency**: `ACC-5`.
  **Acceptance Criteria:**  
  - One‑row permission toggle per clinic/doctor.
  - “Time‑limited access” UI enforcing backend expiry.  

***

## 🟡 Epic 3: AI‑Driven Dispatch & Fulfillment [Phase 2 – T2]  
**Value:** Operational efficiency, smart routing, and smoother handoffs.

- **ACC‑7: Smart Triage Engine**  
  - *As a patient with symptoms, I want to be routed to the correct specialist so I get the right care faster.*  
  - **Dependency**: `ACC-1`.
  **Acceptance Criteria:**  
  - 3–5 question symptom‑checker flow.
  - Auto‑tagging of urgency (Emergency / Urgent / Routine).
  - Specialist recommendation shown before booking.

- **ACC‑8: Pharmacy‑Link Fulfillment**  
  - *As a patient with a new prescription, I want to send it to the nearest Airoli pharmacy in one click.*  
  **Acceptance Criteria:**  
  - “Send to Pharmacy” button on prescription screen.
  - List of local partner pharmacies with distance/ETA.

***

## 🔵 Epic 4: 🚨 Integrated Emergency SOS [Phase 3 – T3]  
**Value:** Lifesaving coordination and reduced anxiety.

- **ACC‑9: Dynamic SOS Dashboard**  
  - *As an emergency user, I want my live location shared with the nearest ER so they can prepare for my arrival.*  
  - **Dependency**: `ACC-3`.
  **Acceptance Criteria:**  
  - Persistent “Emergency Active” banner.
  - Live geolocation stream to hospital ER.

- **ACC‑10: Ambulance Tracker (Live Map)**  
  - *As a panicked user, I want to see the ambulance ETA on a map.*  
  **Acceptance Criteria:**  
  - Real‑time ambulance map markers.
  - ETA countdown and ambulance type (BLS / ALS / ICU).

***

## ⚙️ Non-Functional Requirements (NFRs)
- **Response Time**: All emergency features (`ACC-9`, `ACC-10`) must load and trigger within ≤ 2 seconds on 3G-class networks.
- **Availability**: Offline token viewing (`ACC-3`) must work with 100% reliability even in airplane mode.
- **Compliance**: All data handling in `Epic 2` must adhere to ABDM data privacy guidelines.

***

## ✅ Definition of Done (DoD)
Each Story is considered 'Done' when:
1. **Code Quality**: Peer-reviewed and aligns with project TypeScript standards.
2. **Testing**: Unit tests passed; UI verified on mobile viewport.
3. **Documentation**: Any new types or utility functions are documented in `README.md` or `types/`.
4. **Accessibility**: Interactive elements meet a minimum color contrast of 4.5:1.
