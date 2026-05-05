/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Trash2, TrendingUp, Calendar, Trophy, ChevronRight, PieChart, Clock, Sparkles, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { RecordEntry } from '../types';
import { useBossMode } from './BossModeContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface StatsPageProps {
  records: RecordEntry[];
  deleteRecord: (id: string) => void;
}

const COLORS = ['#FFD700', '#FF7F50', '#48C9B0', '#A36ACF', '#8E9196'];

export default function StatsPage({ records, deleteRecord }: StatsPageProps) {
  const { isBossMode, maskAmount } = useBossMode();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const currentYearRecords = useMemo(() => {
    if (!records) return [];
    const start = new Date(new Date().getFullYear(), 0, 1).getTime();
    const end = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).getTime();
    return records.filter(r => r && r.timestamp && r.timestamp >= start && r.timestamp <= end);
  }, [records]);

  const yearTotal = useMemo(() => {
    return currentYearRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [currentYearRecords]);

  const handleClearYearData = () => {
    if (window.confirm('确定要清空本年度所有记账数据吗？此操作不可撤销。')) {
      currentYearRecords.forEach(r => deleteRecord(r.id));
    }
  };

  const currentMonthRecords = useMemo(() => {
    if (!records) return [];
    const start = startOfMonth(selectedMonth).getTime();
    const end = endOfMonth(selectedMonth).getTime();
    return records
      .filter(r => r && r.timestamp && r.timestamp >= start && r.timestamp <= end)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [records, selectedMonth]);

  const chartData = useMemo(() => {
    if (!selectedMonth) return [];
    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });

    return days.map(day => {
      const total = currentMonthRecords
        .filter(r => r && r.timestamp && isSameDay(new Date(r.timestamp), day))
        .reduce((sum, r) => sum + r.amount, 0);
      return {
        date: format(day, 'd'),
        amount: total,
      };
    });
  }, [currentMonthRecords, selectedMonth]);

  const projectBreakdown = useMemo(() => {
    if (!currentMonthRecords.length) return [];
    const counts: Record<string, number> = {};
    currentMonthRecords.forEach(r => {
      if (r && r.type) {
        counts[r.type] = (counts[r.type] || 0) + r.amount;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [currentMonthRecords]);

  const peakHour = useMemo(() => {
    if (!currentMonthRecords.length) return null;
    const hours = currentMonthRecords.map(r => new Date(r.timestamp).getHours());
    const counts: Record<number, number> = {};
    hours.forEach(h => { counts[h] = (counts[h] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : null;
  }, [currentMonthRecords]);

  const monthTotal = useMemo(() => {
    return currentMonthRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [currentMonthRecords]);

  const serviceCount = currentMonthRecords.length;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl text-[#1A1C1E]">收支流水</h3>
        <button className="flex items-center gap-1 text-xs text-[#8E9196] bg-white px-3 py-2 rounded-xl shadow-sm">
          <Calendar size={14} />
          {format(selectedMonth, 'MMM yyyy', { locale: zhCN })}
        </button>
      </div>

      {/* Yearly Summary Card */}
      <div className="glass-card p-6 rounded-[2rem] border-primary/10 border relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <DollarSign size={80} className="text-primary" />
        </div>
        <p className="text-[10px] font-bold text-[#8E9196] uppercase mb-1">本年累计收入</p>
        <div className="flex items-end justify-between relative z-10">
          <div className="text-3xl font-black text-[#1A1C1E] tracking-tighter">
            <span className="text-lg mr-1 text-primary">￥</span>
            {maskAmount(yearTotal)}
          </div>
          <button 
            onClick={handleClearYearData}
            className="text-[10px] text-gray-400 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-400 transition-colors shadow-sm"
          >
            本年清零
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-3xl flex flex-col items-center">
          <p className="text-[9px] font-bold text-[#8E9196] uppercase mb-1">本月提成</p>
          <div className="text-base font-bold text-[#1A1C1E]">{maskAmount(monthTotal)}</div>
        </div>
        <div className="glass-card p-4 rounded-3xl flex flex-col items-center">
          <p className="text-[9px] font-bold text-[#8E9196] uppercase mb-1">服务人数</p>
          <div className="text-base font-bold text-[#1A1C1E]">{serviceCount} 位</div>
        </div>
        <div className="glass-card p-4 rounded-3xl flex flex-col items-center">
          <p className="text-[9px] font-bold text-[#8E9196] uppercase mb-1">平均提成</p>
          <div className="text-base font-bold text-[#1A1C1E]">
            {serviceCount > 0 ? maskAmount(Math.round(monthTotal / serviceCount)) : '0'}
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="glass-card rounded-[2rem] p-6">
        <p className="text-xs font-bold text-[#8E9196] mb-4 uppercase flex items-center gap-2">
          <TrendingUp size={14} /> 每日提成趋势
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1A1C1E] text-white text-[10px] px-3 py-2 rounded-xl shadow-xl">
                        {`￥${payload[0].value}`}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={Number(entry.amount) > 0 ? '#FFD700' : '#F1F1F1'} 
                  />
                ))}
              </Bar>
              <XAxis dataKey="date" hide />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Breakdown */}
      {projectBreakdown.length > 0 && monthTotal > 0 && (
        <div className="glass-card rounded-[2rem] p-6">
          <p className="text-xs font-bold text-[#8E9196] mb-4 uppercase flex items-center gap-2">
            <PieChart size={14} /> 提成来源分布
          </p>
          <div className="grid grid-cols-2 items-center">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={projectBreakdown}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `￥${value}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
               {projectBreakdown.map((item, index) => (
                 <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-[#1A1C1E] line-clamp-1">{item.name}</span>
                       <span className="text-[9px] text-gray-400">{Math.round((item.value / monthTotal) * 100)}%</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Card */}
      {serviceCount > 0 && (
        <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group">
          <Trophy size={60} className="absolute -bottom-2 -right-2 text-primary opacity-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles size={16} className="text-primary" />
             </div>
             <span className="text-sm font-bold tracking-tight text-[#1A1C1E]">本月成就卡片</span>
          </div>
          <p className="text-sm text-[#8E9196] mb-4 leading-relaxed">
             本月你服务了 <span className="text-primary font-bold">{serviceCount}</span> 位顾客，打败了全国 <span className="text-primary font-bold">90%</span> 的勤奋技师。
             {peakHour !== null && (
               <> 你的黄金接单时段是 <span className="text-primary font-bold">{peakHour}:00</span> 左右。</>
             )}
          </p>
          <button className="w-full py-3 bg-primary/10 text-primary rounded-2xl text-xs font-semibold flex items-center justify-center gap-2">
             生成成就长图 <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* History List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[#1A1C1E]">本月明细账</h4>
          <span className="text-[10px] text-gray-400">共 {currentMonthRecords.length} 笔服务</span>
        </div>
        <div className="space-y-2">
          {currentMonthRecords.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-2xl flex flex-col border border-gray-100 shadow-sm relative group overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                    {record.type.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A1C1E]">{record.type}</div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {format(new Date(record.timestamp), 'MM-dd HH:mm', { locale: zhCN })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-primary tracking-tight">
                    ￥{maskAmount(record.amount)}
                  </div>
                  <button 
                    onClick={() => deleteRecord(record.id)}
                    className="p-2 text-gray-200 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {(record.orderNumber || record.startTime) && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex flex-wrap gap-4 px-1">
                  {record.orderNumber && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] text-gray-500 font-medium tracking-wide">单号: {record.orderNumber}</span>
                    </div>
                  )}
                  {record.startTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-orange-400" />
                      <span className="text-[10px] text-gray-500 font-medium tracking-wide">上钟: {record.startTime}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {currentMonthRecords.length === 0 && (
            <div className="py-20 text-center glass-card rounded-[2rem]">
               <p className="text-gray-400 text-sm italic">本月暂无流水记录</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
