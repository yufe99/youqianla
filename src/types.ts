/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EntryType = 'income' | 'expense';

export interface RecordEntry {
  id: string;
  timestamp: number;
  type: string; // 项目名称 或 支出分类
  amount: number; // 金额 (如果是支出则为正数，但在计算时减去)
  note?: string;
  entryType: EntryType;
  orderNumber?: string; // 订单流水号 (可选，仅收入)
  startTime?: string; // 上钟时间 (可选，仅收入)
}

export interface DreamGoal {
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface ProjectConfig {
  id: string;
  name: string;
  amount: number; // 默认提成金额
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export type ViewType = 'home' | 'stats' | 'settings';
