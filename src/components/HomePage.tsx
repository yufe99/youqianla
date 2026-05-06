/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Mic, Sparkles, Target, X, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RecordEntry, DreamGoal, ProjectConfig, ExpenseCategory } from '../types';
import { useBossMode } from './BossModeContext';
import { BlobIcon } from './BlobIcon';
import ConfettiExplosion from 'react-confetti-explosion';

interface HomePageProps {
  records: RecordEntry[];
  onAddRecord: (entry: RecordEntry) => void;
  onDeleteRecord: (id: string) => void;
  goal: DreamGoal | null;
  projects: ProjectConfig[];
  expenseCategories: ExpenseCategory[];
}

const PROJECT_COLORS = ['bg-[#FFE8CC]', 'bg-[#D3F9D8]', 'bg-[#E3FAFC]', 'bg-[#FFF0F6]', 'bg-[#F3F0FF]', 'bg-[#E7F5FF]'];

export default function HomePage({ records, onAddRecord, onDeleteRecord, goal, projects, expenseCategories }: HomePageProps) {
  const { maskAmount } = useBossMode();
  const [explosion, setExplosion] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customOrderNumber, setCustomOrderNumber] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');

  const todayIncome = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return records
      .filter(r => new Date(r.timestamp).setHours(0, 0, 0, 0) === today && r.entryType === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [records]);

  const todayExpense = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return records
      .filter(r => new Date(r.timestamp).setHours(0, 0, 0, 0) === today && r.entryType === 'expense')
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

    if (entryType === 'income') {
      if (selectedProjectId) {
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
          name = project.name;
          amount = project.amount;
        }
      }
    } else {
      if (selectedExpenseId) {
        const category = expenseCategories.find(c => c.id === selectedExpenseId);
        if (category) {
          name = category.name;
        }
      }
    }

    if (!name || isNaN(amount) || amount <= 0 || name.trim() === '') {
      return;
    }

    onAddRecord({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: name,
      amount: amount,
      entryType: entryType,
      orderNumber: entryType === 'income' ? (customOrderNumber.trim() || undefined) : undefined,
      startTime: entryType === 'income' ? (customStartTime || undefined) : undefined
    });

    setCustomName('');
    setCustomAmount('');
    setCustomOrderNumber('');
    setCustomStartTime('');
    setSelectedProjectId('');
    setSelectedExpenseId('');
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
    <div className="space-y-8">
      {/* Hello Wall - Screenshot Inspired */}
      <section className="pt-4 flex flex-col items-start px-2">
         {explosion && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"><ConfettiExplosion /></div>}
         
         <div className="flex flex-col gap-2">
            <BlobIcon type="happy" size={48} className="animate-float mb-2" />
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1C1E]">
              今日有钱啦
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#8E9196]">你的私人收入暖管家</p>
              <div className="p-1 px-2 border border-black/5 bg-white rounded-lg shadow-sm">
                <Eye size={12} className="text-gray-400" />
              </div>
            </div>
         </div>

         <div className="mt-8 flex items-center gap-3">
            <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center">
              <BlobIcon type="happy" size={40} />
            </div>
            <p className="text-lg font-bold text-[#1A1C1E]">{greeting}</p>
         </div>
      </section>

      {/* Main Stats Card */}
      <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 text-left relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-white/80">
        <div className="absolute -top-12 -right-12 p-4 opacity-5 pointer-events-none">
          <Target size={160} className="rotate-12" />
        </div>
        
        <p className="text-xs font-bold text-[#8E9196] mb-2 uppercase tracking-widest opacity-60">今日净收入实时分拣</p>
        <div className="text-5xl font-black text-[#1A1C1E] tracking-tighter mb-8 tabular-nums">
          <span className="text-2xl mr-1 font-bold">¥</span>{maskAmount(todayIncome - todayExpense)}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#07C160]/5 p-4 rounded-3xl border border-[#07C160]/10">
            <p className="text-[10px] text-[#07C160] font-bold uppercase tracking-wider mb-1">今日提成</p>
            <p className="text-xl font-black text-[#07C160]">+{maskAmount(todayIncome)}</p>
          </div>
          <div className="bg-red-500/5 p-4 rounded-3xl border border-red-500/10">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">今日支出</p>
            <p className="text-xl font-black text-red-500">-{maskAmount(todayExpense)}</p>
          </div>
        </div>
        
        {goal && (
          <div className="mt-8 pt-6 border-t border-gray-100/50 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">目标进度</p>
                <p className="text-sm font-bold text-[#1A1C1E]">{goal.name}</p>
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter">{goalProgress}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_2px_10px_rgba(255,215,0,0.3)] transition-all duration-1000"
              />
            </div>
            <p className="text-[10px] font-bold text-gray-300 text-right">
              还差 <span className="text-[#1A1C1E]">¥{maskAmount(goal.targetAmount - goal.currentAmount)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Center - WeChat Style */}
      <section className="flex flex-col items-center py-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowManualAdd(true)}
          className="group relative flex flex-col items-center gap-3"
        >
          <div className="w-24 h-24 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex items-center justify-center border border-gray-50 active:bg-gray-50 transition-all overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity" />
             <BlobIcon type="happy" size={56} className="relative z-10" />
          </div>
          <span className="text-sm font-black text-[#1A1C1E] tracking-widest px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-white">
            记一笔
          </span>
        </motion.button>
      </section>

      {/* Details Section */}
      <section className="pb-10">
        <div className="flex items-center justify-between px-2 mb-6">
          <div>
            <h3 className="font-black text-xl text-[#1A1C1E] tracking-tight">本日收入明细 实时</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Today's Transactions</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-[#1A1C1E]">今日 {todayRecords.length} 笔</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {todayRecords.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-3xl flex items-center justify-between border border-gray-50 shadow-sm group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${record.entryType === 'income' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-400'}`}>
                  {record.type.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1A1C1E]">{record.type}</div>
                  <div className="text-[9px] text-gray-400">
                    {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 
                    {record.orderNumber && ` · ${record.orderNumber}`}
                    {record.startTime && ` · 上钟: ${record.startTime}`}
                    {record.entryType === 'expense' && ` · 支出记录`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-bold ${record.entryType === 'income' ? 'text-primary' : 'text-red-400'}`}>
                  {record.entryType === 'income' ? '+' : '-'}{maskAmount(record.amount)}
                </div>
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
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[3rem] p-8 pb-12 z-50 shadow-2xl h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-xl text-[#1A1C1E]">手动记一笔</h4>
                <button onClick={() => setShowManualAdd(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
              </div>

              {/* Type Toggle */}
              <div className="flex bg-[#FAFAFA] p-1 rounded-2xl mb-6">
                <button 
                  onClick={() => setEntryType('income')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${entryType === 'income' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                >
                  提成收入
                </button>
                <button 
                  onClick={() => setEntryType('expense')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${entryType === 'expense' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400'}`}
                >
                  支出记账
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {entryType === 'income' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 px-1">选择支出分类</label>
                      <div className="grid grid-cols-2 gap-2">
                        {expenseCategories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedExpenseId(c.id);
                              setCustomName('');
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              selectedExpenseId === c.id 
                                ? 'border-red-400 bg-red-50' 
                                : 'border-gray-100 bg-white'
                            }`}
                          >
                            <div className="text-xs font-bold text-[#1A1C1E]">{c.name}</div>
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedExpenseId('')}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            !selectedExpenseId 
                              ? 'border-red-400 bg-red-50' 
                              : 'border-gray-100 bg-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#1A1C1E]">自定义分类</div>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 px-1">支出金额 (￥)</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-[#FAFAFA] rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-red-400 outline-none"
                      />
                    </div>
                  </>
                )}

                {((entryType === 'income' && !selectedProjectId) || (entryType === 'expense' && !selectedExpenseId)) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 px-1">{entryType === 'income' ? '项目名称' : '支出说明'}</label>
                      <input 
                        type="text" 
                        placeholder={entryType === 'income' ? '例如：高级足浴' : '例如：买水果'}
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className={`w-full bg-[#FAFAFA] rounded-2xl px-5 py-4 text-sm focus:ring-2 outline-none ${entryType === 'income' ? 'ring-primary' : 'ring-red-400'}`}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
              <button 
                onClick={handleManualAdd}
                className={`w-full py-4 text-[#1A1C1E] font-bold rounded-2xl plush-button shadow-lg ${entryType === 'income' ? 'bg-primary shadow-primary/20' : 'bg-red-400 shadow-red-400/20'}`}
              >
                保存{entryType === 'income' ? '收入' : '支出'}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4">提示：{entryType === 'income' ? '流水号及上钟时间为选填项' : '点击分类即可快速记录'}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
