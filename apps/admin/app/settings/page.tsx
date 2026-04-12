'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { settingsGet, settingsPost } from '@/lib/api';

interface IntegrationStatus {
  configured: boolean;
  fields: string[];
}

interface StatusMap {
  mailgun: IntegrationStatus;
  firebase: IntegrationStatus;
  minio: IntegrationStatus;
  cloudflare: IntegrationStatus;
  scraper: IntegrationStatus;
}

interface Setting {
  key: string;
  value: string;
  category: string;
  secret: boolean;
}

const INTEGRATIONS = [
  {
    id: 'mailgun',
    name: 'Mailgun',
    icon: '📧',
    description: 'Email delivery for OTP codes and transactional emails',
    fields: [
      { key: 'mailgun_api_key', label: 'API Key', secret: true, placeholder: 'key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'mailgun_domain', label: 'Domain', secret: false, placeholder: 'mg.barblink.com' },
      { key: 'mailgun_from', label: 'From Address', secret: false, placeholder: 'Barblink <noreply@mg.barblink.com>' },
    ],
  },
  {
    id: 'firebase',
    name: 'Firebase (FCM)',
    icon: '🔔',
    description: 'Push notifications for iOS and Android',
    fields: [
      { key: 'fcm_project_id', label: 'Project ID', secret: false, placeholder: 'barblink-xxxxx' },
      { key: 'fcm_client_email', label: 'Service Account Email', secret: false, placeholder: 'firebase-adminsdk-xxx@barblink.iam.gserviceaccount.com' },
      { key: 'fcm_private_key', label: 'Private Key', secret: true, placeholder: '-----BEGIN PRIVATE KEY-----\\n...' },
    ],
  },
  {
    id: 'minio',
    name: 'MinIO (Media Storage)',
    icon: '🗄️',
    description: 'S3-compatible storage for photos, videos, and media',
    fields: [
      { key: 'minio_endpoint', label: 'Endpoint', secret: false, placeholder: 'localhost' },
      { key: 'minio_port', label: 'Port', secret: false, placeholder: '9000' },
      { key: 'minio_access_key', label: 'Access Key', secret: false, placeholder: 'barblink' },
      { key: 'minio_secret_key', label: 'Secret Key', secret: true, placeholder: 'your-secret-key' },
      { key: 'minio_bucket', label: 'Bucket Name', secret: false, placeholder: 'barblink-media' },
    ],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    icon: '🛡️',
    description: 'CDN, DDoS protection, and DNS management',
    fields: [
      { key: 'cloudflare_api_token', label: 'API Token', secret: true, placeholder: 'your-cloudflare-token' },
      { key: 'cloudflare_zone_id', label: 'Zone ID', secret: false, placeholder: 'your-zone-id' },
    ],
  },
  {
    id: 'scraper',
    name: 'Scraper',
    icon: '🤖',
    description: 'Instagram + Google venue scraping automation',
    fields: [
      { key: 'scraper_interval_hours', label: 'Scrape Interval (hours)', secret: false, placeholder: '12' },
      { key: 'scraper_max_retries', label: 'Max Retries', secret: false, placeholder: '3' },
    ],
  },
];

export default function SettingsPage() {
  const { token } = useAdminAuth();
  const [status, setStatus] = useState<StatusMap | null>(null);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    settingsGet<StatusMap>('/admin/settings/status', token).then(setStatus).catch(() => {});
    settingsGet<Setting[]>('/admin/settings', token).then((s) => {
      setSettings(s);
      const vals: Record<string, string> = {};
      s.forEach((setting) => { vals[setting.key] = setting.value; });
      setValues(vals);
    }).catch(() => {});
  }, [token]);

  const handleSave = async (integrationId: string, fields: typeof INTEGRATIONS[0]['fields']) => {
    if (!token) return;
    setSaving(integrationId);
    try {
      const settingsToSave = fields
        .filter((f) => values[f.key])
        .map((f) => ({
          key: f.key,
          value: values[f.key],
          category: integrationId,
          secret: f.secret,
        }));
      await settingsPost('/admin/settings/bulk', { settings: settingsToSave }, token);
      setSaved(integrationId);
      setTimeout(() => setSaved(null), 2000);
      // Refresh status
      settingsGet<StatusMap>('/admin/settings/status', token).then(setStatus).catch(() => {});
    } catch { /* silent */ }
    setSaving(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Settings</h1>
      <p className="text-ink-mute text-sm mb-8">Configure platform integrations and services</p>

      {/* Integration status overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {INTEGRATIONS.map((int) => {
          const s = status?.[int.id as keyof StatusMap];
          return (
            <div key={int.id} className="bg-surface rounded-xl border border-white/[0.06] p-4 text-center">
              <span className="text-2xl">{int.icon}</span>
              <div className="text-sm font-semibold text-ink mt-2">{int.name}</div>
              <div className={`text-xs font-bold mt-1 ${s?.configured ? 'text-live' : 'text-amber'}`}>
                {s?.configured ? 'Connected' : 'Not configured'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration config sections */}
      <div className="space-y-6">
        {INTEGRATIONS.map((int) => {
          const s = status?.[int.id as keyof StatusMap];
          return (
            <div key={int.id} className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{int.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{int.name}</h3>
                    <p className="text-xs text-ink-mute">{int.description}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${s?.configured ? 'bg-live/20 text-live' : 'bg-amber/20 text-amber'}`}>
                  {s?.configured ? 'Connected' : 'Setup required'}
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {int.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1.5">
                        {field.label}
                        {field.secret && <span className="ml-1 text-amber">🔒</span>}
                      </label>
                      <input
                        type={field.secret ? 'password' : 'text'}
                        value={values[field.key] || ''}
                        onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60 transition placeholder:text-ink-faint/40"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSave(int.id, int.fields)}
                    disabled={saving === int.id}
                    className="px-5 py-2 rounded-lg bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition"
                  >
                    {saving === int.id ? 'Saving...' : 'Save'}
                  </button>
                  {saved === int.id && (
                    <span className="text-live text-sm font-semibold">Saved!</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger zone */}
      <div className="mt-12 bg-surface rounded-xl border border-danger/30 p-6">
        <h3 className="text-sm font-bold text-danger mb-2">Danger Zone</h3>
        <p className="text-xs text-ink-mute mb-4">
          These actions affect the entire platform. Use with caution.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-danger/40 text-danger text-sm font-semibold hover:bg-danger/10 transition">
            Clear All Caches
          </button>
          <button className="px-4 py-2 rounded-lg border border-danger/40 text-danger text-sm font-semibold hover:bg-danger/10 transition">
            Reset Scraper Queue
          </button>
        </div>
      </div>
    </div>
  );
}
