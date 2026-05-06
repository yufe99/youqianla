/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Settings, Plus, Mic, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BossModeProvider, useBossMode } from './components/BossModeContext';
import { apiService } from './lib/api';
import { ViewType, RecordEntry, DreamGoal, ProjectConfig } from './types';
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
  const [loading, setLoading] = useState(true);
  const { isBossMode, toggleBossMode } = useBossMode();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedRecords, loadedGoal, loadedProjects] = await Promise.all([
          apiService.getRecords(),
          apiService.getGoal(),
          apiService.getProjects()
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
      } catch (err) {
        console.warn("Could not sync with cloud, using local storage fallback.");
        setRecords(storage.getRecords());
        setGoal(storage.getGoal());
        setProjects(storage.getProjects());
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
        const updatedGoal = { ...goal, currentAmount: goal.currentAmount + entry.amount };
        await apiService.saveGoal(updatedGoal);
        setGoal(updatedGoal);
        storage.saveGoal(updatedGoal);
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

  const deleteRecord = async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    storage.deleteRecord(id);
    try {
      await apiService.deleteRecord(id);
    } catch (err) {
      console.error("Cloud delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
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
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-[#F8F9FF]">
      {/* Top Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <BlobIcon type="happy" size={48} className="animate-float" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1C1E]">今日有钱啦</h1>
            <p className="text-xs text-[#8E9196] mt-0.5">你的私人收入暖管家</p>
          </div>
        </div>
        <button 
          onClick={toggleBossMode}
          className="p-3 bg-white rounded-2xl shadow-soft-3d text-[#1A1C1E] plush-button"
          title="老板来了模式"
        >
          {isBossMode ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage 
                records={records} 
                onAddRecord={handleAddRecord} 
                goal={goal} 
                projects={projects} 
                onDeleteRecord={deleteRecord}
              />
            </motion.div>
          )}
          {activeView === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StatsPage records={records} deleteRecord={deleteRecord} />
            </motion.div>
          )}
          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsPage 
                 goal={goal} 
                 onSaveGoal={updateGoal} 
                 records={records} 
                 projects={projects} 
                 onSaveProjects={updateProjects}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-8 pb-4 z-20">
        <NavButton 
          active={activeView === 'home'} 
          onClick={() => setActiveView('home')} 
          icon={<BlobIcon type="happy" size={28} />} 
          label="今日" 
        />
        <NavButton 
          active={activeView === 'stats'} 
          onClick={() => setActiveView('stats')} 
          icon={<BlobIcon type="neutral" size={28} />} 
          label="报表" 
        />
        <NavButton 
          active={activeView === 'settings'} 
          onClick={() => setActiveView('settings')} 
          icon={<BlobIcon type="angry" size={28} />} 
          label="设置" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? 'text-[#FFD700] scale-110' : 'text-[#8E9196]'
      }`}
    >
      <div className={`${active ? 'p-1' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
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
