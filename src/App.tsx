/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Settings, Plus, Mic, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BossModeProvider, useBossMode } from './components/BossModeContext';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { firestoreService } from './lib/firestoreService';
import { ViewType, RecordEntry, DreamGoal, ProjectConfig } from './types';
import { storage } from './lib/storage';
import HomePage from './components/HomePage';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import { BlobIcon } from './components/BlobIcon';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [goal, setGoal] = useState<DreamGoal | null>(null);
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const { isBossMode, toggleBossMode } = useBossMode();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Fallback to local storage if not logged in (optional, but keep it for and test)
        setRecords(storage.getRecords());
        setGoal(storage.getGoal());
        setProjects(storage.getProjects());
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubRecords = firestoreService.subscribeRecords(setRecords);
    const unsubGoal = firestoreService.subscribeGoal(setGoal);
    const unsubProjects = firestoreService.subscribeProjects(setProjects);
    
    return () => {
      unsubRecords();
      unsubGoal();
      unsubProjects();
    };
  }, [user]);

  useEffect(() => {
    // Attempt automatic background login if not logged in
    if (!user) {
      const { signInAnonymously } = import('firebase/auth').then(({ signInAnonymously }) => {
        signInAnonymously(auth).catch(err => {
          console.warn("Auto-login failed:", err.message);
        });
      });
    }
  }, [user]);

  const handleAddRecord = (entry: RecordEntry) => {
    if (user) {
      firestoreService.saveRecord(entry);
      if (goal) {
        firestoreService.saveGoal({ ...goal, currentAmount: goal.currentAmount + entry.amount });
      }
    } else {
      storage.saveRecord(entry);
      setRecords(storage.getRecords());
      if (goal) {
        const updatedGoal = { ...goal, currentAmount: goal.currentAmount + entry.amount };
        storage.saveGoal(updatedGoal);
        setGoal(updatedGoal);
      }
    }
  };

  const updateGoal = (newGoal: DreamGoal) => {
    if (user) {
      firestoreService.saveGoal(newGoal);
    } else {
      storage.saveGoal(newGoal);
      setGoal(newGoal);
    }
  };

  const updateProjects = (newProjects: ProjectConfig[]) => {
    if (user) {
      firestoreService.saveProjects(newProjects);
    } else {
      storage.saveProjects(newProjects);
      setProjects(newProjects);
    }
  };

  const deleteRecord = (id: string) => {
    if (user) {
      firestoreService.deleteRecord(id);
    } else {
      storage.deleteRecord(id);
      setRecords(storage.getRecords());
    }
  };

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
