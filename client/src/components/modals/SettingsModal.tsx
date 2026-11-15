import React, { useState } from 'react';
import { X, Settings, Key, User, Calendar, Download, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { updateProfile, updateSettings } from '../../services/api';
import { AppState, UserProfile, AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onStateUpdate: (updater: (prev: AppState) => AppState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appState,
  onStateUpdate
}) => {
  const [tab, setTab] = useState<'profile' | 'ai' | 'outlook' | 'data'>('profile');
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>(appState.profile);
  // Settings state
  const [settings, setSettings] = useState<AppSettings>(appState.settings);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profile);
      onStateUpdate(prev => ({ ...prev, profile }));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings);
      onStateUpdate(prev => ({ ...prev, settings }));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `growth-lab-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas-card border border-canvas-border w-full max-w-2xl rounded-2xl shadow-warm-xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-canvas-border flex items-center justify-between bg-canvas-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-canvas-card border border-canvas-border text-charcoal-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm md:text-base">Studio Settings & Integrations</h3>
              <p className="text-[11px] text-charcoal-500">Configure profile, AI credentials, and calendar sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-canvas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-4 border-b border-canvas-border flex gap-4 text-xs font-semibold bg-canvas-subtle/50">
          <button
            onClick={() => setTab('profile')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'profile'
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Goals</span>
          </button>

          <button
            onClick={() => setTab('ai')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'ai'
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>AI Credentials</span>
          </button>

          <button
            onClick={() => setTab('outlook')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'outlook'
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Outlook Calendar</span>
          </button>

          <button
            onClick={() => setTab('data')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'data'
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Data Export</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {savedNotice && (
            <div className="p-3 bg-forest-50 border border-forest-200 text-forest-700 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Tagline (Personal Growth Principle)
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                    Daily Practice Target (Minutes)
                  </label>
                  <input
                    type="number"
                    value={profile.availableDailyMinutes}
                    onChange={(e) => setProfile({ ...profile, availableDailyMinutes: parseInt(e.target.value, 10) || 20 })}
                    className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                    Learning Difficulty
                  </label>
                  <select
                    value={profile.difficulty}
                    onChange={(e) => setProfile({ ...profile, difficulty: e.target.value as any })}
                    className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate (Recommended for MBA)</option>
                    <option value="Advanced">Advanced (Boardroom / Executive)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* AI Credentials Tab */}
          {tab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-canvas-subtle rounded-xl border border-canvas-border text-xs text-charcoal-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-charcoal-900">
                  <ShieldCheck className="w-4 h-4 text-forest-500" />
                  <span>Secure Server-Side AI Integration</span>
                </div>
                <p className="text-[11px] text-charcoal-600 leading-relaxed">
                  Keys are securely handled on your local server. If no API key is entered, The Growth Lab automatically runs on its <strong>Built-in Critical Thinking Reasoning Engine</strong> without breaking.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900 font-mono"
                />
                <p className="text-[10px] text-charcoal-400 mt-1">
                  Powers Gemini 1.5 Flash for grounded academic explanations and speech critique.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  OpenAI API Key (Optional Alternative)
                </label>
                <input
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900 font-mono"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                Save Credentials
              </button>
            </div>
          )}

          {/* Outlook Calendar Tab */}
          {tab === 'outlook' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-canvas-border bg-canvas-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-charcoal-900">Connection Status</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.outlookCalendar.status === 'connected'
                      ? 'bg-forest-50 text-forest-700 border border-forest-200'
                      : 'bg-charcoal-100 text-charcoal-600 border border-canvas-border'
                  }`}>
                    {settings.outlookCalendar.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Microsoft Graph integration enables authorized syncing of Outlook calendar assignments and deadlines. College LMS deadlines can also be tracked directly in the Academic Planner.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Azure / Microsoft App Client ID
                </label>
                <input
                  type="text"
                  value={settings.outlookCalendar.clientId}
                  onChange={(e) => setSettings({
                    ...settings,
                    outlookCalendar: { ...settings.outlookCalendar, clientId: e.target.value }
                  })}
                  placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900 font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      outlookCalendar: {
                        ...settings.outlookCalendar,
                        status: settings.outlookCalendar.clientId ? 'configured' : 'disconnected'
                      }
                    });
                    handleSaveSettings();
                  }}
                  className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-900 text-white font-semibold text-xs rounded-xl shadow-warm-sm transition-all"
                >
                  Save Calendar Config
                </button>
              </div>
            </div>
          )}

          {/* Data Export Tab */}
          {tab === 'data' && (
            <div className="space-y-4">
              <p className="text-xs text-charcoal-600 leading-relaxed">
                You own 100% of your personal learning data. Export your full state including communication practice attempts, process maps, SOPs, decision journals, and course notes as a JSON file.
              </p>

              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2.5 bg-canvas-card border border-canvas-border hover:border-terracotta-400 text-charcoal-800 hover:text-terracotta-700 rounded-xl text-xs font-bold shadow-warm-sm transition-all"
              >
                <Download className="w-4 h-4 text-terracotta-500" />
                <span>Export Full Learning Studio Backup (.json)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
