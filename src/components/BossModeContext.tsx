/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BossModeContextType {
  isBossMode: boolean;
  toggleBossMode: () => void;
  maskAmount: (amount: number | string) => string;
}

const BossModeContext = createContext<BossModeContextType | undefined>(undefined);

export const BossModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBossMode, setIsBossMode] = useState(() => {
    return localStorage.getItem('boss_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('boss_mode', isBossMode.toString());
  }, [isBossMode]);

  const toggleBossMode = () => setIsBossMode(prev => !prev);

  const maskAmount = (amount: number | string) => {
    if (!isBossMode) return `￥${amount}`;
    return '****';
  };

  return (
    <BossModeContext.Provider value={{ isBossMode, toggleBossMode, maskAmount }}>
      {children}
    </BossModeContext.Provider>
  );
};

export const useBossMode = () => {
  const context = useContext(BossModeContext);
  if (!context) throw new Error('useBossMode must be used within BossModeProvider');
  return context;
};
