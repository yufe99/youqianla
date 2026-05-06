/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Download, ShieldCheck, Heart, Trash2, ArrowRight, Briefcase, X } from 'lucide-react';
import { motion } from 'motion/react';
import { DreamGoal, RecordEntry, ProjectConfig, ExpenseCategory } from '../types';
import { storage } from '../lib/storage';

interface SettingsPageProps {
  goal: DreamGoal | null;
  onSaveGoal: (goal: DreamGoal) => void;
  records: RecordEntry[];
  projects: ProjectConfig[];
  onSaveProjects: (projects: ProjectConfig[]) => void;
  expenseCategories: ExpenseCategory[];
  onSaveExpenseCategories: (categories: ExpenseCategory[]) => void;
}

export default function SettingsPage({ 
  goal, 
  onSaveGoal, 
  records, 
  projects, 
  onSaveProjects,
  expenseCategories,
  onSaveExpenseCategories
}: SettingsPageProps) {
  const [goalName, setGoalName] = useState(goal?.name || '');
  const [goalAmount, setGoalAmount] = useState(goal?.targetAmount || '');
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAmount, setNewProjectAmount] = useState('');

  const [newExpenseName, setNewExpenseName] = useState('');

  const handleAddProject = () => {
    if (!newProjectName || !newProjectAmount) return;
    const newProject: ProjectConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProjectName,
      amount: Number(newProjectAmount)
    };
    onSaveProjects([...projects, newProject]);
    setNewProjectName('');
    setNewProjectAmount('');
  };

  const handleDeleteProject = (id: string) => {
    onSaveProjects(projects.filter(p => p.id !== id));
  };

  const handleAddExpenseCategory = () => {
    if (!newExpenseName) return;
    const newCategory: ExpenseCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: newExpenseName
    };
    onSaveExpenseCategories([...expenseCategories, newCategory]);
    setNewExpenseName('');
  };

  const handleDeleteExpenseCategory = (id: string) => {
    onSaveExpenseCategories(expenseCategories.filter(c => c.id !== id));
  };

  const handleSaveGoal = () => {
    if (!goalName || !goalAmount) return;
    onSaveGoal({
      name: goalName,
      targetAmount: Number(goalAmount),
      currentAmount: records.filter(r => r.entryType === 'income').reduce((acc, curr) => acc + curr.amount, 0)
    });
  };

  const exportToCSV = () => {
    const headers = ['日期', '类型', '项目', '金额', '备注'];
    const rows = records.map(r => [
      new Date(r.timestamp).toLocaleString(),
      r.entryType === 'income' ? '收入' : '支出',
      r.type,
      r.amount,
      r.note || ''
    ]);
    
    const csvContent = "\uFEFF" + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "今日有钱_我的账本.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <h3 className="font-bold text-xl text-[#1A1C1E]">设置与梦想</h3>

      {/* Project Management Section */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-primary" size={18} />
          <h4 className="font-bold text-[#1A1C1E]">常用项目与提成</h4>
        </div>
        <p className="text-xs text-gray-400 mb-4">设置你最高频的工作项目，一键记账更快捷。</p>
        
        <div className="space-y-2 mb-4">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-[#FAFAFA] p-3 rounded-2xl">
              <div>
                <span className="text-sm font-bold text-[#1A1C1E]">{p.name}</span>
                <span className="text-[10px] text-gray-400 ml-2">提成: ￥{p.amount}</span>
              </div>
              <button 
                onClick={() => handleDeleteProject(p.id)}
                className="p-2 text-gray-300 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="项目名" 
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1 bg-[#FAFAFA] rounded-2xl px-4 py-3 text-sm focus:outline-primary border-none"
          />
          <input 
            type="number" 
            placeholder="提成" 
            value={newProjectAmount}
            onChange={(e) => setNewProjectAmount(e.target.value)}
            className="w-20 bg-[#FAFAFA] rounded-2xl px-4 py-3 text-sm focus:outline-primary border-none"
          />
          <button 
            onClick={handleAddProject}
            className="p-3 bg-[#1A1C1E] text-white rounded-2xl plush-button"
          >
            <Plus size={20} />
          </button>
        </div>
      </section>

      {/* Expense Categories Management Section */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="text-red-400" size={18} />
          <h4 className="font-bold text-[#1A1C1E]">自定义支出分类</h4>
        </div>
        <p className="text-xs text-gray-400 mb-4">添加属于你的日常支出项，让每一分钱去向清晰。</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {expenseCategories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 bg-[#FAFAFA] pl-3 pr-1 py-1 rounded-full border border-gray-100">
              <span className="text-xs font-bold text-[#1A1C1E]">{c.name}</span>
              <button 
                onClick={() => handleDeleteExpenseCategory(c.id)}
                className="p-1.5 text-gray-300 hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="新支出分类，如：吸烟" 
            value={newExpenseName}
            onChange={(e) => setNewExpenseName(e.target.value)}
            className="flex-1 bg-[#FAFAFA] rounded-2xl px-4 py-3 text-sm focus:outline-red-300 border-none"
          />
          <button 
            onClick={handleAddExpenseCategory}
            className="p-3 bg-red-400 text-white rounded-2xl plush-button"
          >
            <Plus size={20} />
          </button>
        </div>
      </section>

      {/* Dream Goal Section */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="text-red-400 fill-red-400" size={18} />
          <h4 className="font-bold text-[#1A1C1E]">我的“奔头”目标</h4>
        </div>
        <p className="text-xs text-gray-400 mb-4">设置一个心愿，让每笔提成都有温度。</p>
        
        <div className="space-y-3 mb-4">
          <input 
            type="text" 
            placeholder="我想买..." 
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            className="w-full bg-[#FAFAFA] rounded-2xl px-4 py-3 text-sm focus:outline-primary border-none"
          />
          <input 
            type="number" 
            placeholder="目标金额 (￥)" 
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            className="w-full bg-[#FAFAFA] rounded-2xl px-4 py-3 text-sm focus:outline-primary border-none"
          />
        </div>
        
        <button 
          onClick={handleSaveGoal}
          className="w-full py-3 bg-primary text-[#1A1C1E] font-bold rounded-2xl plush-button text-sm flex items-center justify-center gap-2"
        >
          保存愿望 <ArrowRight size={16} />
        </button>
      </section>

      {/* Security & Data */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-1 px-1">
          <ShieldCheck className="text-[#8E9196]" size={16} />
          <span className="text-xs font-bold text-[#8E9196] uppercase tracking-wider">数据安全</span>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="w-full bg-white p-4 rounded-3xl flex items-center justify-between border border-gray-100 plush-button"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Download size={18} className="text-blue-500" />
            </div>
            <span className="text-sm font-bold text-[#1A1C1E]">导出账目到微信 (CSV)</span>
          </div>
          <ArrowRight size={18} className="text-gray-300" />
        </button>

        <button 
          onClick={() => {
            if (window.confirm('确认清空所有账目吗？此操作不可撤销。该操作仅影响本地缓存，刷新后将重新同步云端。')) {
              storage.clearAll();
              window.location.reload();
            }
          }}
          className="w-full bg-white p-4 rounded-3xl flex items-center justify-between border border-gray-100 plush-button"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <span className="text-sm font-bold text-[#1A1C1E]">清空缓存</span>
          </div>
          <ArrowRight size={18} className="text-gray-300" />
        </button>
      </section>

      <div className="p-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          微信云端身份自动识别已开启<br/>
          数据由微信云托管提供技术支持
        </p>
      </div>

      <div className="p-6 text-center space-y-2 opacity-40">
        <p className="text-xs font-bold text-[#1A1C1E]">今日有钱 v1.2.0</p>
        <p className="text-[10px] text-[#8E9196]">不做采集，只做你最贴心的记账伙伴</p>
      </div>
    </div>
  );
}
