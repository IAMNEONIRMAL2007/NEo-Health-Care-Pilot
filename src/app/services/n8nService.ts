import { toast } from 'sonner';

export interface N8nConfig {
  enabled: boolean;
  urls: {
    tokenCreated: string;
    emergencyTriggered: string;
    patientServed: string;
    wellnessLogged: string;
  };
  headers: Record<string, string>;
}

export interface N8nLog {
  id: string;
  event: string;
  timestamp: string;
  status: 'success' | 'failed' | 'mock';
  responseCode?: number;
  responseText?: string;
  payload: any;
  durationMs: number;
  errorText?: string;
}

const STORAGE_KEYS = {
  CONFIG: 'acc_n8n_config',
  LOGS: 'acc_n8n_logs',
};

const DEFAULT_CONFIG: N8nConfig = {
  enabled: false,
  urls: {
    tokenCreated: '',
    emergencyTriggered: '',
    patientServed: '',
    wellnessLogged: '',
  },
  headers: {},
};

export const n8nService = {
  loadConfig(): N8nConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch (e) {
      console.error('Failed to load n8n config', e);
      return DEFAULT_CONFIG;
    }
  },

  saveConfig(config: N8nConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save n8n config', e);
    }
  },

  getLogs(): N8nLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load n8n logs', e);
      return [];
    }
  },

  clearLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear n8n logs', e);
    }
  },

  appendLog(log: Omit<N8nLog, 'id' | 'timestamp'>) {
    try {
      const logs = this.getLogs();
      const newLog: N8nLog = {
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
      };
      
      // Add to start and cap at 100 entries
      const updatedLogs = [newLog, ...logs].slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Failed to append n8n log', e);
    }
  },

  async triggerWebhook(
    event: 'token_created' | 'emergency_triggered' | 'patient_served' | 'wellness_logged',
    payload: any,
    isTest: boolean = false
  ): Promise<{ status: 'success' | 'failed' | 'mock'; code?: number; error?: string }> {
    const config = this.loadConfig();
    const eventUrlMap: Record<string, keyof N8nConfig['urls']> = {
      token_created: 'tokenCreated',
      emergency_triggered: 'emergencyTriggered',
      patient_served: 'patientServed',
      wellness_logged: 'wellnessLogged',
    };

    const configKey = eventUrlMap[event];
    const targetUrl = config.urls[configKey];

    // standard envelope structure
    const envelope = {
      event,
      timestamp: new Date().toISOString(),
      clinic: {
        name: 'NMMC Hospital Airoli',
        id: 'h1',
        area: 'Sector 8, Airoli, Navi Mumbai',
      },
      data: payload,
      meta: {
        isTest,
        triggeredBy: isTest ? 'test_button' : 'system_event',
      },
    };

    // If disabled globally or no URL configured
    if (!config.enabled || !targetUrl) {
      if (isTest) {
        throw new Error('Integration disabled or no Webhook URL provided for this event.');
      }
      // Log as mock / not sent
      this.appendLog({
        event,
        status: 'mock',
        payload: envelope,
        durationMs: 0,
        responseText: 'Automation skipped (Integration disabled or no webhook URL configured).',
      });
      return { status: 'mock' };
    }

    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers,
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(envelope),
      });

      const durationMs = Math.round(performance.now() - startTime);
      const responseText = await response.text();

      if (response.ok) {
        this.appendLog({
          event,
          status: 'success',
          responseCode: response.status,
          responseText: responseText.slice(0, 500),
          payload: envelope,
          durationMs,
        });
        return { status: 'success', code: response.status };
      } else {
        const errorText = `Server responded with status ${response.status}: ${responseText.slice(0, 200)}`;
        this.appendLog({
          event,
          status: 'failed',
          responseCode: response.status,
          responseText: responseText.slice(0, 500),
          payload: envelope,
          durationMs,
          errorText,
        });
        return { status: 'failed', code: response.status, error: errorText };
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isCors = err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch');
      const errorText = isCors 
        ? 'Network Error / CORS Issue: Verify your n8n instance accepts CORS requests from this domain.'
        : err.message || 'Unknown network error';

      this.appendLog({
        event,
        status: 'failed',
        payload: envelope,
        durationMs,
        errorText,
      });

      return { status: 'failed', error: errorText };
    }
  },

  getWorkflowTemplates() {
    return [
      {
        id: 'bp_token_notifier',
        title: '🎫 Token Booking Notifier',
        description: 'Sends a Slack alert and adds a row to Google Sheets whenever a token is booked. Elevates priorities for emergency appointments.',
        json: JSON.stringify({
          nodes: [
            {
              parameters: {
                path: 'token-created-webhook',
                options: {},
              },
              id: '1a',
              name: 'n8n Webhook',
              type: 'n8n-nodes-base.webhook',
              typeVersion: 1,
              position: [100, 300],
            },
            {
              parameters: {
                conditions: {
                  string: [
                    {
                      value1: '={{$json["data"]["urgency"]}}',
                      value2: 'Routine',
                    },
                  ],
                },
              },
              id: '2a',
              name: 'Check Urgency',
              type: 'n8n-nodes-base.if',
              typeVersion: 1,
              position: [300, 300],
            },
            {
              parameters: {
                channel: '#clinic-appointments',
                text: '=:ticket: *New Token Booked*\n*Patient:* {{$json["data"]["patientName"]}} ({{$json["data"]["age"]}}Y)\n*Department:* {{$json["data"]["department"]}}\n*Token:* *{{$json["data"]["tokenNo"]}}*',
              },
              id: '3a',
              name: 'Slack Alert',
              type: 'n8n-nodes-base.slack',
              typeVersion: 1,
              position: [520, 200],
            },
            {
              parameters: {
                channel: '#urgent-alerts',
                text: '=:warning: *URGENT APPOINTMENT NEEDED*\n*Patient:* {{$json["data"]["patientName"]}}\n*Urgency:* *{{$json["data"]["urgency"]}}*\n*Token:* *{{$json["data"]["tokenNo"]}}*',
              },
              id: '4a',
              name: 'Slack Urgent Alert',
              type: 'n8n-nodes-base.slack',
              typeVersion: 1,
              position: [520, 400],
            },
            {
              parameters: {
                spreadsheetId: 'YOUR_SPREADSHEET_ID',
                sheetName: 'Sheet1',
                columns: {
                  mappingMode: 'defineBelow',
                  value: {
                    Token: '={{$json["data"]["tokenNo"]}}',
                    Patient: '={{$json["data"]["patientName"]}}',
                    Time: '={{$json["timestamp"]}}',
                    Urgency: '={{$json["data"]["urgency"]}}',
                  },
                },
              },
              id: '5a',
              name: 'Google Sheets Log',
              type: 'n8n-nodes-base.googleSheets',
              typeVersion: 4,
              position: [740, 300],
            },
          ],
          connections: {
            'n8n Webhook': {
              main: [[{ node: 'Check Urgency', type: 'main', index: 0 }]],
            },
            'Check Urgency': {
              main: [
                [{ node: 'Slack Alert', type: 'main', index: 0 }],
                [{ node: 'Slack Urgent Alert', type: 'main', index: 0 }],
              ],
            },
            'Slack Alert': {
              main: [[{ node: 'Google Sheets Log', type: 'main', index: 0 }]],
            },
            'Slack Urgent Alert': {
              main: [[{ node: 'Google Sheets Log', type: 'main', index: 0 }]],
            },
          },
        }, null, 2),
      },
      {
        id: 'bp_emergency_cascade',
        title: '🚨 Emergency Alert Cascade',
        description: 'Sends a Twilio SMS blast to all on-call staff and updates an active emergency Slack channel instantly when a user triggers an emergency.',
        json: JSON.stringify({
          nodes: [
            {
              parameters: {
                path: 'emergency-triggered-webhook',
                options: {},
              },
              id: '1b',
              name: 'n8n Webhook',
              type: 'n8n-nodes-base.webhook',
              typeVersion: 1,
              position: [100, 300],
            },
            {
              parameters: {
                message: '=🚨 *CRITICAL EMERGENCY ALERT* 🚨\n*Patient Contact:* {{$json["data"]["patientPhone"]}}\n*Area:* {{$json["data"]["area"]}}\n*ETA:* {{$json["data"]["eta"]}} mins\n*Note:* {{$json["data"]["note"]}}',
                channel: '#emergency-room',
              },
              id: '2b',
              name: 'Slack ER Channel',
              type: 'n8n-nodes-base.slack',
              typeVersion: 1,
              position: [300, 200],
            },
            {
              parameters: {
                fromMobile: 'YOUR_TWILIO_NUMBER',
                toMobile: 'ON_CALL_DOCTOR_NUMBER',
                message: '=EMERGENCY! Patient {{$json["data"]["patientName"]}} triggered alert at {{$json["data"]["area"]}}. ETA {{$json["data"]["eta"]}} mins.',
              },
              id: '3b',
              name: 'Twilio SMS Dr',
              type: 'n8n-nodes-base.twilio',
              typeVersion: 1,
              position: [300, 400],
            },
            {
              parameters: {
                fromMobile: 'YOUR_TWILIO_NUMBER',
                toMobile: 'ON_CALL_AMBULANCE_DR_NUMBER',
                message: '=DISPATCH: Ambulance requested for {{$json["data"]["area"]}}. ETA {{$json["data"]["eta"]}} mins. Map: https://maps.google.com/?q={{$json["data"]["lat"]}},{{$json["data"]["lng"]}}',
              },
              id: '4b',
              name: 'Twilio SMS Driver',
              type: 'n8n-nodes-base.twilio',
              typeVersion: 1,
              position: [500, 400],
            },
          ],
          connections: {
            'n8n Webhook': {
              main: [
                [{ node: 'Slack ER Channel', type: 'main', index: 0 }],
                [{ node: 'Twilio SMS Dr', type: 'main', index: 0 }],
              ],
            },
            'Twilio SMS Dr': {
              main: [[{ node: 'Twilio SMS Driver', type: 'main', index: 0 }]],
            },
          },
        }, null, 2),
      },
      {
        id: 'bp_patient_digest',
        title: '🏥 Patient Served Log & Feedback Builder',
        description: 'Triggers when a doctor completes a consultation. Logs the visit into Google Sheets, waits 24 hours, and emails a feedback form to the patient.',
        json: JSON.stringify({
          nodes: [
            {
              parameters: {
                path: 'patient-served-webhook',
                options: {},
              },
              id: '1c',
              name: 'n8n Webhook',
              type: 'n8n-nodes-base.webhook',
              typeVersion: 1,
              position: [100, 300],
            },
            {
              parameters: {
                spreadsheetId: 'YOUR_SPREADSHEET_ID',
                sheetName: 'VisitsLogs',
                columns: {
                  mappingMode: 'defineBelow',
                  value: {
                    Token: '={{$json["data"]["tokenNo"]}}',
                    Patient: '={{$json["data"]["patientName"]}}',
                    Doctor: '={{$json["data"]["doctorName"]}}',
                    Department: '={{$json["data"]["department"]}}',
                    CompletedAt: '={{$json["timestamp"]}}',
                  },
                },
              },
              id: '2c',
              name: 'Google Sheets DB',
              type: 'n8n-nodes-base.googleSheets',
              typeVersion: 4,
              position: [300, 300],
            },
            {
              parameters: {
                amount: 24,
                unit: 'hours',
              },
              id: '3c',
              name: 'Wait 24 Hours',
              type: 'n8n-nodes-base.wait',
              typeVersion: 1,
              position: [500, 300],
            },
            {
              parameters: {
                fromEmail: 'noreply@neocare.in',
                toEmail: '={{$json["data"]["phone"]}}', // Simulated
                subject: 'How was your clinic visit yesterday?',
                html: '=Dear {{$json["data"]["patientName"]}},<br><br>Thank you for visiting Dr. {{$json["data"]["doctorName"]}} yesterday. We hope you are feeling better. Please share your rating here: <a href="https://neocare.in/feedback">Feedback Form</a>.',
              },
              id: '4c',
              name: 'Send Feedback Email',
              type: 'n8n-nodes-base.email',
              typeVersion: 1,
              position: [700, 300],
            },
          ],
          connections: {
            'n8n Webhook': {
              main: [[{ node: 'Google Sheets DB', type: 'main', index: 0 }]],
            },
            'Google Sheets DB': {
              main: [[{ node: 'Wait 24 Hours', type: 'main', index: 0 }]],
            },
            'Wait 24 Hours': {
              main: [[{ node: 'Send Feedback Email', type: 'main', index: 0 }]],
            },
          },
        }, null, 2),
      },
    ];
  },
};
