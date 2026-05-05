/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RecordEntry {
  id: string;
  timestamp: number;
  type: string; // 项目名称
  amount: number; // 提成金额
  note?: string;
  orderNumber?: string; // 订单流水号 (可选)
  startTime?: string; // 上钟时间
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

export type ViewType = 'home' | 'stats' | 'settings';
