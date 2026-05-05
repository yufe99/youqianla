import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { BlobIcon } from './BlobIcon';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const simulateScan = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin();
    }, 2000);
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
            onClick={() => setShowQR(true)}
            className="w-full bg-[#07C160] hover:bg-[#06ae56] text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#07C160]/20 transition-all active:scale-[0.98] z-10"
          >
            <MessageCircle size={22} fill="white" />
            微信扫码登录
          </button>
          
          <button 
            onClick={() => onLogin()}
            className="w-full bg-white border border-gray-100 text-[#1A1C1E] py-4 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 transition-all"
          >
            <Smartphone size={20} />
            快捷测试登录 (点此直接进入)
          </button>
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

      {/* QR Code Modal Simulation */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[320px] bg-white rounded-[3rem] p-8 flex flex-col items-center shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="font-bold text-lg text-[#1A1C1E]">微信扫码</h3>
                <p className="text-xs text-gray-400">使用微信扫描下方二维码登录</p>
              </div>

              <div 
                onClick={simulateScan}
                className="relative w-48 h-48 bg-gray-50 rounded-3xl flex items-center justify-center border-4 border-gray-100 group cursor-pointer"
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-primary font-bold">验证中...</span>
                  </div>
                ) : (
                  <>
                    <div className="relative p-4 bg-white rounded-2xl shadow-inner">
                      <QrCode size={120} className="text-[#1A1C1E]" strokeWidth={1.5} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center border-2 border-[#1A1C1E]">
                        <BlobIcon type="happy" size={20} />
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-primary/5 transition-colors rounded-3xl">
                       <p className="text-[10px] font-bold text-transparent group-hover:text-primary transition-colors">点击模拟扫码成功</p>
                    </div>
                  </>
                )}
              </div>

              <p className="mt-8 text-[10px] text-gray-400 text-center">
                首次登录将自动为您创建账户<br />
                继续即表示同意 <span className="text-primary underline">服务协议</span>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
