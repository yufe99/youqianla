/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Settings, Plus, Mic, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BossModeProvider, useBossMode } from './components/BossModeContext';
import { apiService } from './lib/api';
import { ViewType, RecordEntry, DreamGoal, ProjectConfig, ExpenseCategory } from './types';
import { storage } from './lib/storage';
import HomePage from './components/HomePage';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';
import { BlobIcon } from './components/BlobIcon';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [goal, setGoal] = useState<DreamGoal | null>(null);
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { isBossMode, toggleBossMode } = useBossMode();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedRecords, loadedGoal, loadedProjects, loadedExpenseCategories] = await Promise.all([
          apiService.getRecords(),
          apiService.getGoal(),
          apiService.getProjects(),
          apiService.getExpenseCategories()
        ]);
        
        // If server is empty, try to migrate from local storage
        if (loadedRecords.length === 0) {
          const localRecords = storage.getRecords();
          if (localRecords.length > 0) {
            await Promise.all(localRecords.map(r => apiService.saveRecord(r)));
            setRecords(localRecords);
          } else {
            setRecords([]);
          }
        } else {
          setRecords(loadedRecords);
        }

        if (!loadedGoal) {
          const localGoal = storage.getGoal();
          if (localGoal) {
            await apiService.saveGoal(localGoal);
            setGoal(localGoal);
          }
        } else {
          setGoal(loadedGoal);
        }

        if (loadedProjects.length === 0) {
          const localProjects = storage.getProjects();
          if (localProjects.length > 0) {
            await apiService.saveProjects(localProjects);
            setProjects(localProjects);
          }
        } else {
          setProjects(loadedProjects);
        }

        if (loadedExpenseCategories.length === 0) {
          const localExpenses = storage.getExpenseCategories();
          if (localExpenses.length > 0) {
            await apiService.saveExpenseCategories(localExpenses);
            setExpenseCategories(localExpenses);
          }
        } else {
          setExpenseCategories(loadedExpenseCategories);
        }
      } catch (err) {
        console.warn("Could not sync with cloud, using local storage fallback.");
        setRecords(storage.getRecords());
        setGoal(storage.getGoal());
        setProjects(storage.getProjects());
        setExpenseCategories(storage.getExpenseCategories());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddRecord = async (entry: RecordEntry) => {
    setRecords(prev => [entry, ...prev]);
    storage.saveRecord(entry);
    
    try {
      await apiService.saveRecord(entry);
      if (goal) {
        // Only income contributes to goal progress (based on previous logic, but expenses could deduct it)
        // User didn't specify, but usually goals are income targets.
        // Let's only update goal if it's income.
        if (entry.entryType === 'income') {
          const updatedGoal = { ...goal, currentAmount: goal.currentAmount + entry.amount };
          await apiService.saveGoal(updatedGoal);
          setGoal(updatedGoal);
          storage.saveGoal(updatedGoal);
        }
      }
    } catch (err) {
      console.error("Cloud save failed");
    }
  };

  const updateGoal = async (newGoal: DreamGoal) => {
    setGoal(newGoal);
    storage.saveGoal(newGoal);
    try {
      await apiService.saveGoal(newGoal);
    } catch (err) {
      console.error("Cloud goal save failed");
    }
  };

  const updateProjects = async (newProjects: ProjectConfig[]) => {
    setProjects(newProjects);
    storage.saveProjects(newProjects);
    try {
      await apiService.saveProjects(newProjects);
    } catch (err) {
      console.error("Cloud projects save failed");
    }
  };

  const updateExpenseCategories = async (newCategories: ExpenseCategory[]) => {
    setExpenseCategories(newCategories);
    storage.saveExpenseCategories(newCategories);
    try {
      await apiService.saveExpenseCategories(newCategories);
    } catch (err) {
      console.error("Cloud expense categories save failed");
    }
  };

  const deleteRecord = async (id: string) => {
    const recordToDelete = records.find(r => r.id === id);
    setRecords(prev => prev.filter(r => r.id !== id));
    storage.deleteRecord(id);
    try {
      await apiService.deleteRecord(id);
      // If we deleted an income record, we should probably update the goal back
      if (recordToDelete && recordToDelete.entryType === 'income' && goal) {
         const updatedGoal = { ...goal, currentAmount: Math.max(0, goal.currentAmount - recordToDelete.amount) };
         updateGoal(updatedGoal);
      }
    } catch (err) {
      console.error("Cloud delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F8F9FF]">
        <div className="flex flex-col items-center gap-6">
          <BlobIcon type="happy" size={80} className="animate-bounce" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-[#07C160] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-bold tracking-widest mt-4">正在同步云端账本...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full mx-auto relative overflow-hidden bg-[#F8F9FF]">
      {/* Safe Area Top */}
      <div className="h-[env(safe-area-inset-top)] bg-[#F8F9FF] shrink-0" />
      
      {/* Top Header - Floating Boss Mode (Moved to left to avoid WeChat capsule) */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top)+0.75rem)] left-6 z-[60]">
        <button 
          onClick={toggleBossMode}
          className="p-2.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm text-[#1A1C1E] active:scale-95 transition-all border border-white/50"
        >
          {isBossMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-[max(5.5rem,env(safe-area-inset-bottom)+5rem)] pt-6">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <HomePage 
                records={records} 
                onAddRecord={handleAddRecord} 
                goal={goal} 
                projects={projects} 
                expenseCategories={expenseCategories}
                onDeleteRecord={deleteRecord}
              />
            </motion.div>
          )}
          {activeView === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <StatsPage records={records} deleteRecord={deleteRecord} />
            </motion.div>
          )}
          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SettingsPage 
                 goal={goal} 
                 onSaveGoal={updateGoal} 
                 records={records} 
                 projects={projects} 
                 onSaveProjects={updateProjects}
                 expenseCategories={expenseCategories}
                 onSaveExpenseCategories={updateExpenseCategories}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <NavButton 
          active={activeView === 'home'} 
          onClick={() => setActiveView('home')} 
          icon={<BlobIcon type={activeView === 'home' ? 'happy' : 'neutral'} size={activeView === 'home' ? 32 : 28} />} 
          label="记账账本" 
        />
        <NavButton 
          active={activeView === 'stats'} 
          onClick={() => setActiveView('stats')} 
          icon={<BarChart3 size={24} strokeWidth={activeView === 'stats' ? 2.5 : 2} />} 
          label="月度分析" 
        />
        <NavButton 
          active={activeView === 'settings'} 
          onClick={() => setActiveView('settings')} 
          icon={<Settings size={24} strokeWidth={activeView === 'settings' ? 2.5 : 2} />} 
          label="我的管理" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all outline-none active:scale-90 ${active ? 'text-[#07C160]' : 'text-[#8E9196]'}`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-tight ${active ? 'text-[#1A1C1E] opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <BossModeProvider>
      <AppContent />
    </BossModeProvider>
  );
}
