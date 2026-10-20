import React from 'react';
import { UserPreferences } from '../types';
import { X, SlidersHorizontal, EyeOff, VolumeX, Play, Tv, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    onUpdatePreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10 text-zinc-200">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* NSFW Blur */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <EyeOff className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="font-semibold text-zinc-200">Blur NSFW Media</div>
                <div className="text-[11px] text-zinc-500">Requires click-to-reveal on sensitive posts</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.blurNsfw}
              onChange={(e) => handleChange('blurNsfw', e.target.checked)}
              className="w-4 h-4 accent-[#FF4500] rounded cursor-pointer"
            />
          </div>

          {/* Autoplay Videos */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="font-semibold text-zinc-200">Autoplay Videos</div>
                <div className="text-[11px] text-zinc-500">Play video clips automatically in feed</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoplayVideos}
              onChange={(e) => handleChange('autoplayVideos', e.target.checked)}
              className="w-4 h-4 accent-[#FF4500] rounded cursor-pointer"
            />
          </div>

          {/* Mute by Default */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="font-semibold text-zinc-200">Mute Videos by Default</div>
                <div className="text-[11px] text-zinc-500">Start media audio muted</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.muteVideos}
              onChange={(e) => handleChange('muteVideos', e.target.checked)}
              className="w-4 h-4 accent-[#FF4500] rounded cursor-pointer"
            />
          </div>

          {/* Ambient Glow in Cinema Mode */}
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="font-semibold text-zinc-200">Ambient Backlight Glow</div>
                <div className="text-[11px] text-zinc-500">Subtle backdrop halo in Cinema mode</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.ambientGlow}
              onChange={(e) => handleChange('ambientGlow', e.target.checked)}
              className="w-4 h-4 accent-[#FF4500] rounded cursor-pointer"
            />
          </div>

          {/* Cinema Slideshow Duration */}
          <div className="py-2">
            <div className="flex items-center gap-3 mb-2">
              <Tv className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="font-semibold text-zinc-200">Default Cinema Slide Interval</div>
                <div className="text-[11px] text-zinc-500">Time spent on each photo before advancing</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[3, 5, 8, 12].map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleChange('slideshowSpeed', sec)}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    preferences.slideshowSpeed === sec
                      ? 'bg-[#FF4500] border-[#FF4500] text-white font-bold'
                      : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {sec} seconds
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
