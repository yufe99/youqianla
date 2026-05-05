/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Mic, Sparkles, Target, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RecordEntry, DreamGoal, ProjectConfig } from '../types';
import { useBossMode } from './BossModeContext';
import { BlobIcon } from './BlobIcon';
import ConfettiExplosion from 'react-confetti-explosion';

interface HomePageProps {
  records: RecordEntry[];
  onAddRecord: (entry: RecordEntry) => void;
  onDeleteRecord: (id: string) => void;
  goal: DreamGoal | null;
  projects: ProjectConfig[];
}

const PROJECT_COLORS = ['bg-[#FFE8CC]', 'bg-[#D3F9D8]', 'bg-[#E3FAFC]', 'bg-[#FFF0F6]', 'bg-[#F3F0FF]', 'bg-[#E7F5FF]'];

export default function HomePage({ records, onAddRecord, onDeleteRecord, goal, projects }: HomePageProps) {
  const { maskAmount } = useBossMode();
  const [explosion, setExplosion] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customOrderNumber, setCustomOrderNumber] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');

  const todayTotal = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return records
      .filter(r => new Date(r.timestamp).setHours(0, 0, 0, 0) === today)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [records]);

  const todayRecords = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return records
      .filter(r => new Date(r.timestamp).setHours(0, 0, 0, 0) === today)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [records]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨了，辛苦了，早点休息吧';
    if (hour < 11) return '新的一天开始了，今天要加油赚提成哦';
    if (hour < 14) return '中午好，吃块肉补充能量';
    if (hour < 18) return '下午好，每一单都是为了更好的生活';
    if (hour < 22) return '晚上好，每一份汗水都有回报';
    return '夜深了，记完最后一笔就睡吧';
  }, []);

  const handleManualAdd = () => {
    let name = customName;
    let amount = Number(customAmount);

    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        name = project.name;
        amount = project.amount;
      }
    }

    // 只校验名称和有效金额，流水号和上钟时间现在是选填
    if (!name || isNaN(amount) || amount <= 0 || name.trim() === '') {
      return;
    }

    onAddRecord({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: name,
      amount: amount,
      orderNumber: customOrderNumber.trim() || undefined,
      startTime: customStartTime || undefined
    });
    setCustomName('');
    setCustomAmount('');
    setCustomOrderNumber('');
    setCustomStartTime('');
    setSelectedProjectId('');
    setShowManualAdd(false);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setExplosion(true);
    setTimeout(() => setExplosion(false), 2000);
  };

  const goalProgress = useMemo(() => {
    if (!goal) return 0;
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  }, [goal]);

  return (
    <div className="space-y-6">
      {/* Hello Wall */}
      <section className="mt-2 text-center py-4">
         {explosion && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"><ConfettiExplosion /></div>}
         <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4 relative"
         >
            <div className="absolute inset-0 bg-[#FFD700] opacity-10 blur-2xl animate-pulse"></div>
            <BlobIcon type="happy" size={80} className="animate-float z-10" />
         </motion.div>
         <h2 className="text-lg font-medium text-[#1A1C1E] px-4">{greeting}</h2>
      </section>

      {/* Main Card */}
      <div className="glass-card rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Target size={120} className="-mr-10 -mt-10 rotate-12" />
        </div>
        
        <p className="text-sm font-medium text-[#8E9196] mb-2 uppercase tracking-widest">今日提成</p>
        <div className="text-5xl font-bold text-[#1A1C1E] tracking-tight mb-4">
          {maskAmount(todayTotal)}
        </div>
        
        {goal && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-medium px-1">
              <span className="text-[#8E9196]">{goal.name}</span>
              <span className="text-primary">{goalProgress}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#F1F1F1] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              />
            </div>
            <p className="text-[10px] text-[#A0A0A0]">距离愿望达成还差 {maskAmount(goal.targetAmount - goal.currentAmount)}</p>
          </div>
        )}
      </div>

      {/* Add Button - Large Logo Style (Soft/Harmonious) */}
      <section className="flex justify-center py-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowManualAdd(true)}
          className="relative group"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
          <div className="relative w-28 h-28 bg-white/60 backdrop-blur-xl border-4 border-primary/20 rounded-full flex flex-col items-center justify-center shadow-soft-3d group-hover:border-primary/40 transition-colors">
            <BlobIcon type="happy" size={54} showShadow={false} />
            <span className="text-primary font-bold text-xs mt-1">记一笔</span>
          </div>
        </motion.button>
      </section>

      {/* Daily Details List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1A1C1E] flex items-center gap-2">
            本日收入明细 <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">实时</span>
          </h3>
          <span className="text-[10px] text-gray-400">今日 {todayRecords.length} 笔</span>
        </div>
        
        <div className="space-y-3">
          {todayRecords.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-3xl flex items-center justify-between border border-gray-50 shadow-sm group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-primary font-bold">
                  {record.type.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1A1C1E]">{record.type}</div>
                  <div className="text-[9px] text-gray-400">
                    {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 
                    {record.orderNumber && ` · ${record.orderNumber}`}
                    {record.startTime && ` · 上钟: ${record.startTime}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-primary">+{maskAmount(record.amount)}</div>
                <button 
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-1.5 text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="删除此笔记录"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {todayRecords.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs text-gray-400">今天还没有记账哦，点击上方按钮开始吧</p>
            </div>
          )}
        </div>
      </section>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showManualAdd && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualAdd(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[3rem] p-8 pb-12 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-xl text-[#1A1C1E]">手动记一笔</h4>
                <button onClick={() => setShowManualAdd(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 px-1">订单流水号</label>
                    <input 
                      type="text" 
                      placeholder="输入流水号 (可选)" 
                      value={customOrderNumber}
                      onChange={(e) => setCustomOrderNumber(e.target.value)}
                      className="w-full bg-[#FAFAFA] rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 px-1">上钟时间</label>
                    <input 
                      type="time" 
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="w-full bg-[#FAFAFA] rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1">选择常用项目</label>
                  <div className="grid grid-cols-2 gap-2">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setCustomName('');
                          setCustomAmount('');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedProjectId === p.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#1A1C1E]">{p.name}</div>
                        <div className="text-[10px] text-gray-400">提成 ￥{p.amount}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedProjectId('')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        !selectedProjectId 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1A1C1E]">自定义项目</div>
                      <div className="text-[10px] text-gray-400">手动输入金额</div>
                    </button>
                  </div>
                </div>

                {!selectedProjectId && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 px-1">项目名称</label>
                      <input 
                        type="text" 
                        placeholder="例如：高级足浴" 
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-[#FAFAFA] rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 px-1">提成金额 (￥)</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-[#FAFAFA] rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-primary outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
              <button 
                onClick={handleManualAdd}
                className="w-full py-4 bg-primary text-[#1A1C1E] font-bold rounded-2xl plush-button shadow-lg shadow-primary/20"
              >
                保存记账
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4">提示：流水号及上钟时间为选填项</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
