import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Smartphone, QrCode } from 'lucide-react';
import { BlobIcon } from './BlobIcon';
import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-6 border-4 border-primary/10">
             <BlobIcon type="happy" size={50} />
          </div>
          <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tighter">今日有钱啦</h1>
          <p className="text-gray-400 text-sm mt-1">每一笔努力，都值得被记录</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-[#07C160] hover:bg-[#06ae56] text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#07C160]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Smartphone size={22} fill="white" />
            立即开始使用 (数据同步至云端)
          </button>

          {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-[#8E9196]">
          <div className="flex flex-col items-center gap-1">
             <ShieldCheck size={18} />
             <span className="text-[10px]">安稳加密</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
             <QrCode size={18} />
             <span className="text-[10px]">极速同步</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
