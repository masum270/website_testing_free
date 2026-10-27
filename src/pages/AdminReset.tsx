import React, { useState } from 'react';
import { resetEverything } from '../utils/resetAll.js';
import { AlertTriangle, Trash2, CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

interface AdminResetProps {
  onNavigateHome: () => void;
}

export const AdminReset: React.FC<AdminResetProps> = ({ onNavigateHome }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [removedKeysCount, setRemovedKeysCount] = useState(0);

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure? Sob data delete hobe! All user progress, leaderboards, exam history, and queues will be reset to 0.'
    );

    if (!confirmed) return;

    setIsResetting(true);
    try {
      const count = await resetEverything();
      setRemovedKeysCount(count);
      setResetCompleted(true);
    } catch (e) {
      console.error('Reset error:', e);
      alert('Reset process encountered an issue, but local storage was cleared.');
      setResetCompleted(true);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">System Data Reset</h1>
              <p className="text-xs text-slate-400">Leaderboard & Progress Clean</p>
            </div>
          </div>
          <button
            onClick={onNavigateHome}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="হোমে ফিরুন"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {resetCompleted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-400">
              ✅ Sob clean! Leaderboard 0, Sobar progress 0
            </h2>
            <p className="text-xs text-slate-300">
              সমস্ত ক্যাশ, লিডারবোর্ড ও স্টুডেন্ট এক্সাম ডাটা সম্পূর্ণ নতুনভাবে (0) রিসেট করা হয়েছে।
            </p>
            <button
              onClick={onNavigateHome}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
            >
              হোম পেজে ফিরে যান
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> সতর্কবার্তা
              </div>
              <p>
                এই বাটনে ক্লিক করলে সমস্ত ইউজারদের অর্জিত পয়েন্ট, পরীক্ষার ইতিহাস, লিডারবোর্ড রেকর্ড এবং অনুশীলনের ক্রম 0 থেকে শুরু হবে।
              </p>
            </div>

            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-base tracking-wide transition-all transform active:scale-95"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> রিসেট করা হচ্ছে...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" /> 🔴 RESET EVERYTHING - Leaderboard + Progress Clean
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
