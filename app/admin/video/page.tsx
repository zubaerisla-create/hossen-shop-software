'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Video, Upload, CheckCircle2, Play, Pause, RefreshCw, Save, ShieldAlert, Sparkles, Eye, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { showSuccessToast, showErrorToast } from '@/app/utils/alert';

interface LandingVideoSettings {
  title: string;
  subtitle: string;
  badgeText: string;
  videoUrl: string;
  thumbnailUrl: string;
  isEnabled: boolean;
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
}

export default function AdminLandingVideoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [settings, setSettings] = useState<LandingVideoSettings>({
    title: 'Experience Our Engineering Showcase',
    subtitle: 'Watch our full-stack capabilities in action and explore how we craft state-of-the-art web architectures.',
    badgeText: 'FEATURED SHOWCASE',
    videoUrl: '',
    thumbnailUrl: '',
    isEnabled: true,
    autoPlay: false,
    loop: true,
    muted: true,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideoSettings();
  }, []);

  const fetchVideoSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/landing-video`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.videoConfig) {
          setSettings(data.data.videoConfig);
        }
      }
    } catch (err) {
      console.error('Failed to fetch landing video settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      showErrorToast('Please select a valid video file (.mp4, .webm, etc.)');
      return;
    }

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Admin authentication token missing. Please log in.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setSettings(prev => ({ ...prev, videoUrl: data.url }));
        showSuccessToast('Video uploaded successfully!');
      } else {
        throw new Error(data.message || 'Failed to upload video');
      }
    } catch (err: any) {
      console.error('Video upload error:', err);
      showErrorToast(err.message || 'Failed to upload video file.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token missing. Please log in again.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/landing-video`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showSuccessToast('Landing video section settings updated successfully!');
        if (data.data && data.data.videoConfig) {
          setSettings(data.data.videoConfig);
        }
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (err: any) {
      console.error('Failed to save landing video settings:', err);
      showErrorToast(err.message || 'Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#09090b] z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200/80 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Landing Page Video Section
          </h2>
          <p className="text-zinc-500 text-[10px]">
            Configure and upload the .mp4 showcase video displayed under the &quot;Our Capabilities&quot; section on the main landing page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving || uploading}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all text-[11px] disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Settings
            </>
          )}
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-8 flex-1 bg-white dark:bg-zinc-950 transition-colors">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-wider">
              Loading Video Settings...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form & File Upload */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Main Content Box */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 space-y-5">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Video Details & Content
                </h3>

                {/* Badge text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={settings.badgeText}
                    onChange={(e) => setSettings({ ...settings, badgeText: e.target.value })}
                    placeholder="e.g. FEATURED SHOWCASE"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>

                {/* Section Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Section Heading / Title
                  </label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    placeholder="e.g. Experience Our Engineering Showcase"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>

                {/* Section Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.subtitle}
                    onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                    placeholder="Describe what the video demonstrates..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Upload & Video URL Box */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 space-y-5">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-500" />
                  Video File & Source URL
                </h3>

                {/* File Upload zone */}
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-purple-500/50 rounded-xl p-6 text-center transition-all bg-white/50 dark:bg-zinc-950/50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-file-input"
                  />
                  <label
                    htmlFor="video-file-input"
                    className="cursor-pointer flex flex-col items-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                      {uploading ? 'Uploading Video...' : 'Click to Upload .mp4 Video File'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Supports MP4, WebM, QuickTime up to 10MB
                    </span>
                  </label>

                  {uploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-purple-600 text-[11px] font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing & saving file to cloud server...
                    </div>
                  )}
                </div>

                {/* Direct Video URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Direct Video MP4 URL
                  </label>
                  <input
                    type="text"
                    value={settings.videoUrl}
                    onChange={(e) => setSettings({ ...settings, videoUrl: e.target.value })}
                    placeholder="/Create_a_premium_cinematic_her.mp4 or https://res.cloudinary.com/..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[9.5px] text-zinc-400 block">
                    Tip: You can use a local path like <code className="text-purple-400 font-mono">/Create_a_premium_cinematic_her.mp4</code> or upload a custom file.
                  </span>
                </div>
              </div>

              {/* Display & Behavior Toggles */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wide">
                  Player Options & Visibility
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Enable Section */}
                  <label className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                    <div>
                      <span className="font-bold text-xs text-zinc-900 dark:text-white block">Enable Section</span>
                      <span className="text-[10px] text-zinc-400">Show video section on landing page</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.isEnabled}
                      onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </label>

                  {/* AutoPlay */}
                  <label className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                    <div>
                      <span className="font-bold text-xs text-zinc-900 dark:text-white block">AutoPlay Video</span>
                      <span className="text-[10px] text-zinc-400">Play automatically when visible</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoPlay}
                      onChange={(e) => setSettings({ ...settings, autoPlay: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </label>

                  {/* Loop */}
                  <label className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                    <div>
                      <span className="font-bold text-xs text-zinc-900 dark:text-white block">Loop Video</span>
                      <span className="text-[10px] text-zinc-400">Repeat video continuously</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.loop}
                      onChange={(e) => setSettings({ ...settings, loop: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </label>

                  {/* Muted */}
                  <label className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                    <div>
                      <span className="font-bold text-xs text-zinc-900 dark:text-white block">Muted Audio</span>
                      <span className="text-[10px] text-zinc-400">Mute audio by default</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.muted}
                      onChange={(e) => setSettings({ ...settings, muted: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </label>

                </div>
              </div>

            </div>

            {/* Right Column: Live Landing Page Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-white space-y-6 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-extrabold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Live Section Preview
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${settings.isEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {settings.isEnabled ? 'LIVE ON LANDING PAGE' : 'HIDDEN'}
                  </span>
                </div>

                {/* Simulated Capabilities Header Context */}
                <div className="text-center space-y-1.5 opacity-60">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">[Capabilities Section Above]</span>
                </div>

                <div className="relative border-t border-zinc-800 pt-6 space-y-4 text-center">
                  
                  {/* Badge */}
                  {settings.badgeText && (
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-extrabold tracking-widest uppercase">
                      {settings.badgeText}
                    </span>
                  )}

                  <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight uppercase">
                    {settings.title || 'Our Showcase Video'}
                  </h3>

                  <p className="text-zinc-400 text-[11px] leading-relaxed max-w-sm mx-auto font-medium">
                    {settings.subtitle || 'Discover how we deliver high quality software and production-ready applications.'}
                  </p>

                  {/* Video Player Box */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group mt-4">
                    {settings.videoUrl ? (
                      <>
                        <video
                          ref={videoRef}
                          src={settings.videoUrl}
                          autoPlay={settings.autoPlay}
                          loop={settings.loop}
                          muted={settings.muted}
                          playsInline
                          controls
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          className="w-full h-full object-cover"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-500 p-6">
                        <Video className="w-8 h-8 text-zinc-700" />
                        <span className="text-[11px] font-bold text-zinc-400">No Video File Configured</span>
                        <span className="text-[9px] text-zinc-600">Upload a .mp4 video or paste a URL to preview</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                  <span>Below Our Capabilities</span>
                  <span>Position #2</span>
                </div>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
