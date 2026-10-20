import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'J / ↓', label: 'Scroll to Next Media Post' },
    { key: 'K / ↑', label: 'Scroll to Previous Media Post' },
    { key: 'Space', label: 'Play / Pause Video or Advance Cinema Slide' },
    { key: 'M', label: 'Mute / Unmute Audio' },
    { key: 'S or L', label: 'Save / Bookmark Active Post' },
    { key: 'C', label: 'Open Post Comments Drawer' },
    { key: 'F', label: 'Toggle Fullscreen Mode' },
    { key: 'Esc', label: 'Close Lightbox or Modal' },
    { key: '?', label: 'Open this Keyboard Shortcuts Guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10 text-zinc-200">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-1.5 border-b border-white/[0.04] text-xs last:border-none"
            >
              <span className="text-zinc-300">{s.label}</span>
              <kbd className="px-2 py-1 bg-zinc-800 border border-white/10 rounded font-mono text-zinc-200 font-semibold shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] text-center text-[11px] text-zinc-500">
          Tip: Press <kbd className="font-mono text-zinc-300">?</kbd> at any time to reopen this menu.
        </div>
      </div>
    </div>
  );
};
