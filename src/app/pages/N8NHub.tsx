import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAppState } from '../contexts/AppStateContext';
import { n8nService, N8nConfig, N8nLog } from '../services/n8nService';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Bell, Play, CheckCircle2, XCircle, Terminal,
  ArrowRight, Activity, Clock, Clipboard, Download, RefreshCw,
  Sliders, Eye, EyeOff, ExternalLink, Lock, AlertCircle, Trash2, Check,
  ChevronDown, ChevronUp, FileText, Share2
} from 'lucide-react';
import { toast } from 'sonner';

export const N8NHub = () => {
  const navigate = useNavigate();
  const { userRole } = useAppState();

  const [activeTab, setActiveTab] = useState<'config' | 'simulator' | 'blueprints' | 'logs'>('config');
  const [config, setConfig] = useState<N8nConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<N8nLog[]>([]);
  const [copiedBlueprint, setCopiedBlueprint] = useState<string | null>(null);

  // Webhook Test states
  const [testingEvent, setTestingEvent] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; code?: number; error?: string }>>({});

  // Simulator states
  const [simEvent, setSimEvent] = useState<'token_created' | 'emergency_triggered' | 'patient_served' | 'wellness_logged'>('token_created');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0: Idle, 1: Triggered, 2: Router, 3: Completed Actions
  const [simConsole, setSimConsole] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Log filter states
  const [logFilterEvent, setLogFilterEvent] = useState<string>('all');
  const [logFilterStatus, setLogFilterStatus] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Load config & logs
  useEffect(() => {
    setConfig(n8nService.loadConfig());
    setLogs(n8nService.getLogs());
  }, []);

  // Scroll console to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simConsole]);

  // Handle access restrictions
  const isAuthorized = userRole === 'Doctor' || userRole === 'Reception';

  const handleGlobalToggle = (enabled: boolean) => {
    const next = { ...config, enabled };
    setConfig(next);
    n8nService.saveConfig(next);
    toast.success(enabled ? 'n8n Webhook triggers enabled!' : 'n8n Webhook triggers disabled.');
  };

  const handleUrlChange = (eventKey: keyof N8nConfig['urls'], url: string) => {
    const next = {
      ...config,
      urls: {
        ...config.urls,
        [eventKey]: url,
      },
    };
    setConfig(next);
    n8nService.saveConfig(next);
  };

  const handleSaveConfig = () => {
    n8nService.saveConfig(config);
    toast.success('n8n Webhook Configuration saved successfully!');
  };

  const handleTestWebhook = async (event: 'token_created' | 'emergency_triggered' | 'patient_served' | 'wellness_logged', eventKey: keyof N8nConfig['urls']) => {
    const url = config.urls[eventKey];
    if (!url) {
      toast.error(`Please enter a Webhook URL for the ${event} event first.`);
      return;
    }
    if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
      toast.warning('n8n webhooks should use HTTPS in production.');
    }

    setTestingEvent(event);
    try {
      const mockPayload = getMockPayloadForEvent(event);
      const res = await n8nService.triggerWebhook(event, mockPayload, true);
      
      setTestResults(prev => ({
        ...prev,
        [event]: { ok: res.status === 'success', code: res.code, error: res.error },
      }));

      if (res.status === 'success') {
        toast.success(`Test Event Sent! Webhook returned status code: ${res.code}`);
      } else {
        toast.error(`Test Event Failed: ${res.error || 'Server returned error status'}`);
      }
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [event]: { ok: false, error: err.message },
      }));
      toast.error(`Webhook Test Error: ${err.message}`);
    } finally {
      setTestingEvent(null);
      setLogs(n8nService.getLogs()); // refresh logs
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all execution logs?')) {
      n8nService.clearLogs();
      setLogs([]);
      toast.success('Logs cleared.');
    }
  };

  const handleExportLogs = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `n8n_automation_logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Logs exported.');
    } catch (e) {
      toast.error('Failed to export logs');
    }
  };

  const handleCopyBlueprint = (blueprintId: string, json: string) => {
    navigator.clipboard.writeText(json);
    setCopiedBlueprint(blueprintId);
    toast.success('Blueprint JSON copied to clipboard!');
    setTimeout(() => setCopiedBlueprint(null), 2000);
  };

  // Run Simulator
  const runSimulation = async () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimStep(1);
    setSimConsole([`[${new Date().toLocaleTimeString()}] 🚀 Initializing workflow simulator for: ${simEvent}`]);

    const steps = getSimulationSteps(simEvent);
    
    // Simulate node traversal steps with delay
    for (let i = 0; i < steps.length; i++) {
      await delay(800);
      setSimStep(i + 2);
      setSimConsole(prev => [...prev, ...steps[i].logs]);
    }

    // Simultaneously trigger actual webhook in background if configured
    const mockPayload = getMockPayloadForEvent(simEvent);
    const hasUrl = config.urls[getEventUrlKey(simEvent)];
    
    if (config.enabled && hasUrl) {
      setSimConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔌 Dispatching real payload to configured URL: ${hasUrl.slice(0, 30)}...`]);
      const res = await n8nService.triggerWebhook(simEvent, mockPayload);
      if (res.status === 'success') {
        setSimConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🟢 Real webhook responded successfully: 200 OK`]);
      } else if (res.status === 'failed') {
        setSimConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔴 Real webhook returned error: ${res.error || '500'}`]);
      }
    } else {
      setSimConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ℹ️ Real webhook dispatch skipped (disabled or URL not configured)`]);
    }

    await delay(300);
    setSimConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Simulation execution complete.`]);
    setLogs(n8nService.getLogs()); // refresh logs
    setSimRunning(false);
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    const matchEvent = logFilterEvent === 'all' || log.event === logFilterEvent;
    const matchStatus = logFilterStatus === 'all' || log.status === logFilterStatus;
    return matchEvent && matchStatus;
  });

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6 min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
              n8n Automation Hub
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Connect and automate clinic events via external n8n workflows
            </p>
          </div>
          <button
            onClick={() => navigate(userRole ? '/portal/dashboard' : '/settings')}
            className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Global Toggle */}
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl border border-orange-100 mt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-xl flex items-center justify-center font-black">
              🔌
            </div>
            <div>
              <p className="text-xs font-black text-orange-950">Master Automation Toggle</p>
              <p className="text-[10px] font-medium text-orange-700">Enable/disable external webhook POST calls</p>
            </div>
          </div>
          <button
            onClick={() => handleGlobalToggle(!config.enabled)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              config.enabled ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              animate={{ x: config.enabled ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-4 pt-3 flex gap-1.5 border-b border-gray-200 bg-white">
        <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Sliders className="w-4 h-4" />} label="Configure Webhooks" />
        <TabButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} icon={<Play className="w-4 h-4" />} label="Live Simulator" />
        <TabButton active={activeTab === 'blueprints'} onClick={() => setActiveTab('blueprints')} icon={<FileText className="w-4 h-4" />} label="Blueprints" />
        <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal className="w-4 h-4" />} label="Audit Logs" badge={logs.length} />
      </div>

      {/* Restricted screen for Patients */}
      {!isAuthorized ? (
        <div className="p-6 flex-1 flex flex-col items-center justify-center max-w-sm mx-auto text-center mt-12">
          <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center justify-center mb-4 text-red-500 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-gray-900">Access Restricted</h3>
          <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">
            The n8n Automation Hub is an administrative/developer dashboard restricted to clinic staff (Receptionists and Doctors).
          </p>
          <div className="mt-6 space-y-3 w-full">
            <button
              onClick={() => navigate('/portal')}
              className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all"
            >
              Sign in as Clinic Staff
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex-1">
          {/* TAB 1: WEBHOOK CONFIGURATION */}
          {activeTab === 'config' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-orange-500" /> Event Webhooks
                </h3>
                <p className="text-xs font-semibold text-gray-400 mb-4 leading-relaxed">
                  Enter your n8n Production or Test webhook URLs. These events trigger automatically in the background.
                </p>

                <div className="space-y-4">
                  <ConfigItem
                    label="🎫 Token Created"
                    description="Fires when a patient registers or books a token."
                    eventKey="tokenCreated"
                    event="token_created"
                    url={config.urls.tokenCreated}
                    onChange={handleUrlChange}
                    onTest={handleTestWebhook}
                    isTesting={testingEvent === 'token_created'}
                    testResult={testResults['token_created']}
                  />

                  <ConfigItem
                    label="🚨 Emergency Alert Triggered"
                    description="Fires instantly when a patient taps the Emergency button."
                    eventKey="emergencyTriggered"
                    event="emergency_triggered"
                    url={config.urls.emergencyTriggered}
                    onChange={handleUrlChange}
                    onTest={handleTestWebhook}
                    isTesting={testingEvent === 'emergency_triggered'}
                    testResult={testResults['emergency_triggered']}
                  />

                  <ConfigItem
                    label="🏥 Patient Served (Consultation Completed)"
                    description="Fires when a doctor marks a patient as served/completed."
                    eventKey="patientServed"
                    event="patient_served"
                    url={config.urls.patientServed}
                    onChange={handleUrlChange}
                    onTest={handleTestWebhook}
                    isTesting={testingEvent === 'patient_served'}
                    testResult={testResults['patient_served']}
                  />

                  <ConfigItem
                    label="📊 Wellness Logged"
                    description="Fires when a patient records new wellness vitals."
                    eventKey="wellnessLogged"
                    event="wellness_logged"
                    url={config.urls.wellnessLogged}
                    onChange={handleUrlChange}
                    onTest={handleTestWebhook}
                    isTesting={testingEvent === 'wellness_logged'}
                    testResult={testResults['wellness_logged']}
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-gray-900">🔒 Authorization Headers (Optional)</h4>
                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">
                  Pass custom authentication keys (e.g. `X-N8N-API-KEY` or `Authorization`) to authorize incoming payloads on your n8n instance.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Header Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Authorization"
                      value={Object.keys(config.headers)[0] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const oldVal = Object.values(config.headers)[0] || '';
                        const nextHeaders = val ? { [val]: oldVal } : {};
                        setConfig(prev => ({ ...prev, headers: nextHeaders }));
                      }}
                      className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Header Value</label>
                    <input
                      type="password"
                      placeholder="Sensitive token"
                      value={Object.values(config.headers)[0] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const oldKey = Object.keys(config.headers)[0] || 'Authorization';
                        const nextHeaders = oldKey ? { [oldKey]: val } : {};
                        setConfig(prev => ({ ...prev, headers: nextHeaders }));
                      }}
                      className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-300 outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveConfig}
                  className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: WORKFLOW SIMULATOR */}
          {activeTab === 'simulator' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-black text-gray-900">Live Workflow Visualizer</h3>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={simEvent}
                      onChange={(e) => setSimEvent(e.target.value as any)}
                      className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 outline-none font-bold text-gray-700 shadow-sm shrink-0"
                    >
                      <option value="token_created">🎫 Token Created</option>
                      <option value="emergency_triggered">🚨 Emergency Triggered</option>
                      <option value="patient_served">🏥 Patient Served</option>
                      <option value="wellness_logged">📊 Wellness Logged</option>
                    </select>
                    <button
                      onClick={runSimulation}
                      disabled={simRunning}
                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-sm active:scale-95 transition-all flex items-center gap-1"
                    >
                      {simRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      Run
                    </button>
                  </div>
                </div>

                {/* SVG Visual Canvas */}
                <div className="border border-gray-150 rounded-2xl bg-gray-50 p-2 relative overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-[180px]" viewBox="0 0 380 200">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 2 L 8 5 L 0 8 z" fill="#CBD5E1" />
                      </marker>
                      <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 2 L 8 5 L 0 8 z" fill="#F97316" />
                      </marker>
                      <style>
                        {`
                          .pulse-line {
                            stroke-dasharray: 8;
                            animation: dash 1.5s linear infinite;
                          }
                          @keyframes dash {
                            to {
                              stroke-dashoffset: -40;
                            }
                          }
                        `}
                      </style>
                    </defs>

                    {/* Nodes Connector Lines */}
                    {/* Event to Webhook */}
                    <line
                      x1="45" y1="100" x2="115" y2="100"
                      stroke={simStep >= 1 ? '#F97316' : '#E2E8F0'}
                      strokeWidth={simStep >= 1 ? '2.5' : '1.5'}
                      className={simStep === 1 ? 'pulse-line' : ''}
                      markerEnd={simStep >= 1 ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />

                    {/* Webhook to Router */}
                    <line
                      x1="135" y1="100" x2="195" y2="100"
                      stroke={simStep >= 2 ? '#F97316' : '#E2E8F0'}
                      strokeWidth={simStep >= 2 ? '2.5' : '1.5'}
                      className={simStep === 2 ? 'pulse-line' : ''}
                      markerEnd={simStep >= 2 ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />

                    {/* Router to Slack (Top) */}
                    <path
                      d="M 215 100 Q 255 60 295 60"
                      fill="none"
                      stroke={simStep >= 3 && isSimPathActive(simEvent, 'Slack') ? '#F97316' : '#E2E8F0'}
                      strokeWidth={simStep >= 3 && isSimPathActive(simEvent, 'Slack') ? '2.5' : '1.5'}
                      className={simStep === 3 && isSimPathActive(simEvent, 'Slack') ? 'pulse-line' : ''}
                      markerEnd={simStep >= 3 && isSimPathActive(simEvent, 'Slack') ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />

                    {/* Router to Twilio (Middle) */}
                    <line
                      x1="215" y1="100" x2="295" y2="100"
                      stroke={simStep >= 3 && isSimPathActive(simEvent, 'Twilio') ? '#F97316' : '#E2E8F0'}
                      strokeWidth={simStep >= 3 && isSimPathActive(simEvent, 'Twilio') ? '2.5' : '1.5'}
                      className={simStep === 3 && isSimPathActive(simEvent, 'Twilio') ? 'pulse-line' : ''}
                      markerEnd={simStep >= 3 && isSimPathActive(simEvent, 'Twilio') ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />

                    {/* Router to Sheets/Email (Bottom) */}
                    <path
                      d="M 215 100 Q 255 140 295 140"
                      fill="none"
                      stroke={simStep >= 3 && isSimPathActive(simEvent, 'Sheets') ? '#F97316' : '#E2E8F0'}
                      strokeWidth={simStep >= 3 && isSimPathActive(simEvent, 'Sheets') ? '2.5' : '1.5'}
                      className={simStep === 3 && isSimPathActive(simEvent, 'Sheets') ? 'pulse-line' : ''}
                      markerEnd={simStep >= 3 && isSimPathActive(simEvent, 'Sheets') ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />

                    {/* Node Circles */}
                    {/* Node 1: Event (Trigger Source) */}
                    <g transform="translate(45, 100)">
                      <circle r="18" fill={simStep >= 1 ? '#FFEDD5' : '#F1F5F9'} stroke={simStep >= 1 ? '#F97316' : '#94A3B8'} strokeWidth="2" />
                      <text textAnchor="middle" y="4" fontSize="11" fontWeight="bold" fill={simStep >= 1 ? '#C2410C' : '#475569'}>App</text>
                      <text textAnchor="middle" y="32" fontSize="9" fontWeight="bold" fill="#64748B">1. Event</text>
                    </g>

                    {/* Node 2: Webhook Node */}
                    <g transform="translate(135, 100)">
                      <circle r="18" fill={simStep >= 2 ? '#FFEDD5' : '#F1F5F9'} stroke={simStep >= 2 ? '#F97316' : '#94A3B8'} strokeWidth="2" />
                      <text textAnchor="middle" y="4" fontSize="14" fill={simStep >= 2 ? '#C2410C' : '#475569'}>🔌</text>
                      <text textAnchor="middle" y="32" fontSize="9" fontWeight="bold" fill="#64748B">2. Webhook</text>
                    </g>

                    {/* Node 3: Router Node */}
                    <g transform="translate(215, 100)">
                      <circle r="18" fill={simStep >= 3 ? '#FFEDD5' : '#F1F5F9'} stroke={simStep >= 3 ? '#F97316' : '#94A3B8'} strokeWidth="2" />
                      <text textAnchor="middle" y="4" fontSize="11" fontWeight="bold" fill={simStep >= 3 ? '#C2410C' : '#475569'}>IF</text>
                      <text textAnchor="middle" y="32" fontSize="9" fontWeight="bold" fill="#64748B">3. Router</text>
                    </g>

                    {/* Node 4: Slack */}
                    <g transform="translate(315, 60)">
                      <circle r="16" fill={simStep >= 4 && isSimPathActive(simEvent, 'Slack') ? '#ECFDF5' : '#F8FAFC'} stroke={simStep >= 4 && isSimPathActive(simEvent, 'Slack') ? '#10B981' : '#E2E8F0'} strokeWidth="2" />
                      <text textAnchor="middle" y="4" fontSize="10" fill={simStep >= 4 && isSimPathActive(simEvent, 'Slack') ? '#047857' : '#94A3B8'}>💬</text>
                      <text textAnchor="start" x="22" y="3" fontSize="9" fontWeight="bold" fill={simStep >= 4 && isSimPathActive(simEvent, 'Slack') ? '#065F46' : '#64748B'}>Slack</text>
                    </g>

                    {/* Node 5: Twilio */}
                    <g transform="translate(315, 100)">
                      <circle r="16" fill={simStep >= 4 && isSimPathActive(simEvent, 'Twilio') ? '#ECFDF5' : '#F8FAFC'} stroke={simStep >= 4 && isSimPathActive(simEvent, 'Twilio') ? '#10B981' : '#E2E8F0'} strokeWidth="2" />
                      <text textAnchor="middle" y="4" fontSize="10" fill={simStep >= 4 && isSimPathActive(simEvent, 'Twilio') ? '#047857' : '#94A3B8'}>✉️</text>
                      <text textAnchor="start" x="22" y="3" fontSize="9" fontWeight="bold" fill={simStep >= 4 && isSimPathActive(simEvent, 'Twilio') ? '#065F46' : '#64748B'}>Twilio</text>
                    </g>

                    {/* Node 6: Sheets/Email */}
                    <g transform="translate(315, 140)">
                      <circle r="16" fill={simStep >= 4 && isSimPathActive(simEvent, 'Sheets') ? '#ECFDF5' : '#F8FAFC'} stroke={simStep >= 4 && isSimPathActive(simEvent, 'Sheets') ? '#10B981' : '#E2E8F0'} strokeWidth="2" />
                      <text textAnchor="middle" y="4" fontSize="10" fill={simStep >= 4 && isSimPathActive(simEvent, 'Sheets') ? '#047857' : '#94A3B8'}>
                        {simEvent === 'patient_served' ? '📧' : '📊'}
                      </text>
                      <text textAnchor="start" x="22" y="3" fontSize="9" fontWeight="bold" fill={simStep >= 4 && isSimPathActive(simEvent, 'Sheets') ? '#065F46' : '#64748B'}>
                        {simEvent === 'patient_served' ? 'Email' : 'Sheets'}
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Console Log Panel */}
                <div className="mt-4 bg-gray-900 rounded-2xl p-4 font-mono text-xs text-gray-300 shadow-inner">
                  <div className="flex items-center gap-1.5 text-gray-400 border-b border-gray-800 pb-2 mb-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>n8n Simulator Terminal</span>
                  </div>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                    {simConsole.length === 0 ? (
                      <div className="text-gray-600 italic">Select an event and click Run to start simulation...</div>
                    ) : (
                      simConsole.map((line, idx) => (
                        <div key={idx} className={line.includes('🔴') || line.includes('Error') ? 'text-red-400' : line.includes('🟢') || line.includes('✓') ? 'text-emerald-400' : ''}>
                          {line}
                        </div>
                      ))
                    )}
                    <div ref={consoleBottomRef} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: WORKFLOW BLUEPRINTS */}
          {activeTab === 'blueprints' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Pre-built n8n Workflows</h3>
                  <p className="text-xs font-semibold text-gray-400 mt-1 leading-relaxed">
                    Copy these JSON blueprints and import them directly into your n8n workflow editor. Open n8n, click anywhere on the canvas, and press `Ctrl + V`.
                  </p>
                </div>

                <div className="space-y-4">
                  {n8nService.getWorkflowTemplates().map(bp => (
                    <div key={bp.id} className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50">
                      <div className="bg-white px-4 py-3 border-b border-gray-150 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-gray-900">{bp.title}</h4>
                          <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{bp.description}</p>
                        </div>
                        <button
                          onClick={() => handleCopyBlueprint(bp.id, bp.json)}
                          className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1 hover:bg-orange-100 transition-colors shrink-0"
                        >
                          {copiedBlueprint === bp.id ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                          {copiedBlueprint === bp.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="p-3">
                        <pre className="text-[10px] text-gray-600 font-mono overflow-x-auto max-h-[140px] bg-white p-2.5 rounded-xl border border-gray-150 scrollbar-thin">
                          {bp.json}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="text-sm font-black text-gray-900">Automation Trigger Logs</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportLogs}
                      disabled={logs.length === 0}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 rounded-xl text-xs font-black uppercase tracking-tight border border-gray-200 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button
                      onClick={handleClearLogs}
                      disabled={logs.length === 0}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-tight border border-red-100 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-150">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Event Type</label>
                    <select
                      value={logFilterEvent}
                      onChange={(e) => setLogFilterEvent(e.target.value)}
                      className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="all">All Events</option>
                      <option value="token_created">🎫 Token Created</option>
                      <option value="emergency_triggered">🚨 Emergency Triggered</option>
                      <option value="patient_served">🏥 Patient Served</option>
                      <option value="wellness_logged">📊 Wellness Logged</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Status</label>
                    <select
                      value={logFilterStatus}
                      onChange={(e) => setLogFilterStatus(e.target.value)}
                      className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="success">🟢 Success (200 OK)</option>
                      <option value="failed">🔴 Failed / Error</option>
                      <option value="mock">🟡 Mock / Simulated</option>
                    </select>
                  </div>
                </div>

                {/* Logs List */}
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-2">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-500">No logs match your filter</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Trigger a simulation or a clinic event to generate logs.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {filteredLogs.map(log => {
                      const isExpanded = expandedLogId === log.id;
                      const isEmergency = log.event === 'emergency_triggered';
                      return (
                        <div key={log.id} className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`text-xs px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide shrink-0 ${
                                log.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                log.status === 'failed' ? 'bg-red-50 text-red-500 border border-red-100' :
                                'bg-yellow-50 text-yellow-600 border border-yellow-100'
                              }`}>
                                {log.status === 'success' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Mock'}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-gray-800 truncate">
                                  {log.event === 'token_created' ? '🎫 Token Created' :
                                   log.event === 'emergency_triggered' ? '🚨 Emergency' :
                                   log.event === 'patient_served' ? '🏥 Patient Served' :
                                   '📊 Wellness Logged'}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                                  {new Date(log.timestamp).toLocaleTimeString()} • {log.durationMs}ms
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {log.responseCode && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  log.responseCode === 200 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {log.responseCode}
                                </span>
                              )}
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-150 bg-gray-50 p-3 space-y-2.5 text-[10px]"
                              >
                                {log.errorText && (
                                  <div className="p-2.5 bg-red-50 border border-red-150 text-red-700 rounded-xl font-bold">
                                    ⚠️ {log.errorText}
                                  </div>
                                )}
                                <div>
                                  <span className="block font-black text-gray-400 uppercase tracking-wider mb-1">Payload Envelope:</span>
                                  <pre className="p-2.5 bg-white border border-gray-150 rounded-xl overflow-x-auto text-gray-600 font-mono">
                                    {JSON.stringify(log.payload, null, 2)}
                                  </pre>
                                </div>
                                {log.responseText && (
                                  <div>
                                    <span className="block font-black text-gray-400 uppercase tracking-wider mb-1">Response Snippet:</span>
                                    <pre className="p-2.5 bg-white border border-gray-150 rounded-xl overflow-x-auto text-gray-600 font-mono max-h-[80px]">
                                      {log.responseText}
                                    </pre>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

// Sub-components
const TabButton = ({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) => (
  <button
    onClick={onClick}
    className={`py-3 px-2 flex items-center gap-1.5 border-b-2 text-xs font-black transition-all relative outline-none whitespace-nowrap flex-1 justify-center ${
      active ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-700'
    }`}
  >
    {icon}
    <span className="relative">
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-3 bg-orange-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </span>
  </button>
);

const ConfigItem = ({
  label, description, eventKey, event, url, onChange, onTest, isTesting, testResult
}: {
  label: string; description: string; eventKey: keyof N8nConfig['urls']; event: any; url: string;
  onChange: (key: keyof N8nConfig['urls'], val: string) => void;
  onTest: (evt: any, key: keyof N8nConfig['urls']) => void;
  isTesting: boolean;
  testResult?: { ok: boolean; code?: number; error?: string };
}) => (
  <div className="p-3 border border-gray-150 rounded-2xl hover:border-gray-200 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="text-xs font-black text-gray-800">{label}</h4>
        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{description}</p>
      </div>
      {/* Test chip */}
      {testResult && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
          testResult.ok ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'
        }`}>
          Last test: {testResult.ok ? `200 OK` : `Error`}
        </span>
      )}
    </div>
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="https://your-n8n-domain/webhook/..."
        value={url}
        onChange={(e) => onChange(eventKey, e.target.value)}
        className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-300 outline-none"
      />
      <button
        onClick={() => onTest(event, eventKey)}
        disabled={isTesting}
        className="px-3 py-2 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 active:scale-95 flex items-center justify-center gap-1"
      >
        {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
      </button>
    </div>
  </div>
);

// Helpers & Mock Data
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

const getEventUrlKey = (event: string): keyof N8nConfig['urls'] => {
  const map: Record<string, keyof N8nConfig['urls']> = {
    token_created: 'tokenCreated',
    emergency_triggered: 'emergencyTriggered',
    patient_served: 'patientServed',
    wellness_logged: 'wellnessLogged',
  };
  return map[event] || 'tokenCreated';
};

const getMockPayloadForEvent = (event: string) => {
  const time = new Date().toISOString();
  switch (event) {
    case 'token_created':
      return {
        id: 'ut_mock123',
        patientId: 'p_1',
        tokenNo: 'A-21',
        bookedAt: time,
        status: 'Booked',
        department: 'General Physician',
        doctorName: 'Dr. Priya Sharma',
        patientName: 'Rohan Deshmukh',
        phone: '+91 98765 43999',
        age: 25,
        appointmentTime: '11:30 AM',
        paymentMethod: 'Online',
        paymentStatus: 'Success',
        urgency: 'Routine',
      };
    case 'emergency_triggered':
      return {
        id: 'e_mock123',
        patientPhone: '+91 98765 43999',
        patientName: 'Rohan Deshmukh',
        hospitalId: 'h1',
        eta: 5,
        area: 'Sector 8, Airoli',
        status: 'pending',
        timestamp: time,
        lat: 19.1497,
        lng: 72.9974,
        note: 'Mock Emergency dispatch test',
      };
    case 'patient_served':
      return {
        id: 'ut_mock123',
        patientId: 'p_1',
        tokenNo: 'A-21',
        bookedAt: time,
        status: 'Completed',
        department: 'General Physician',
        doctorName: 'Dr. Priya Sharma',
        patientName: 'Rohan Deshmukh',
        phone: '+91 98765 43999',
        age: 25,
        paymentStatus: 'Success',
      };
    case 'wellness_logged':
      return {
        id: 'wl_mock123',
        patientId: 'p_1',
        type: 'HeartRate',
        value: 78,
        unit: 'bpm',
        timestamp: time,
        note: 'Normal heartbeat recorded during simulator testing',
      };
    default:
      return {};
  }
};

const isSimPathActive = (event: string, nodeName: 'Slack' | 'Twilio' | 'Sheets') => {
  if (event === 'emergency_triggered') {
    return nodeName === 'Slack' || nodeName === 'Twilio';
  }
  if (event === 'token_created') {
    return true; // all
  }
  if (event === 'patient_served') {
    return nodeName === 'Sheets'; // Google Sheets (or Gmail)
  }
  if (event === 'wellness_logged') {
    return nodeName === 'Sheets';
  }
  return false;
};

const getSimulationSteps = (event: string) => {
  const t = () => new Date().toLocaleTimeString();
  switch (event) {
    case 'emergency_triggered':
      return [
        {
          logs: [
            `[${t()}] 📡 Webhook received payload: { event: "emergency_triggered", patient: "Rohan Deshmukh" }`,
            `[${t()}] ⚙️ Router: evaluating conditions...`,
            `[${t()}] ℹ️ Urgency evaluated as CRITICAL Emergency`
          ]
        },
        {
          logs: [
            `[${t()}] ✉️ Twilio: sending SMS alert to doctor-on-call (+91-98765-43000)...`,
            `[${t()}] 🟢 Twilio: SMS dispatched successfully. SID: SM${Math.floor(Math.random()*90000)+10000}`,
            `[${t()}] 💬 Slack: posting to channel #emergency-room...`,
            `[${t()}] 🟢 Slack: posted alert card. Timestamp: ${Date.now()}.0012`
          ]
        }
      ];
    case 'token_created':
      return [
        {
          logs: [
            `[${t()}] 📡 Webhook received payload: { event: "token_created", tokenNo: "A-21" }`,
            `[${t()}] ⚙️ Router: evaluating conditions...`,
            `[${t()}] ℹ️ Urgency is Routine. Routing to Standard channel.`
          ]
        },
        {
          logs: [
            `[${t()}] 📊 Google Sheets: appending row in "AppointmentsLogs" spreadsheet...`,
            `[${t()}] 🟢 Google Sheets: row successfully appended: A-21 | Rohan Deshmukh`,
            `[${t()}] 💬 Slack: posting token update to #clinic-appointments channel...`,
            `[${t()}] 🟢 Slack: channel notification sent.`
          ]
        }
      ];
    case 'patient_served':
      return [
        {
          logs: [
            `[${t()}] 📡 Webhook received payload: { event: "patient_served", tokenNo: "A-21" }`,
            `[${t()}] ⚙️ Router: logging completion metrics...`
          ]
        },
        {
          logs: [
            `[${t()}] 📊 Google Sheets: writing completion row in "VisitsLogs" spreadsheet...`,
            `[${t()}] 🟢 Google Sheets: row written successfully.`,
            `[${t()}] 📧 Email: queuing 24h post-visit feedback trigger...`,
            `[${t()}] 🟢 Email: scheduled check-up follow-up feedback to patient.`
          ]
        }
      ];
    case 'wellness_logged':
      return [
        {
          logs: [
            `[${t()}] 📡 Webhook received payload: { event: "wellness_logged", type: "HeartRate" }`,
            `[${t()}] ⚙️ Router: analyzing vitals reading...`
          ]
        },
        {
          logs: [
            `[${t()}] 📊 Google Sheets: logging metric '78 bpm' to Google Sheets database...`,
            `[${t()}] 🟢 Google Sheets: logged row successfully.`,
            `[${t()}] ℹ️ Vital signs within healthy parameters. No warnings triggered.`
          ]
        }
      ];
    default:
      return [];
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
