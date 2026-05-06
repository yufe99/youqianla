/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecordEntry, DreamGoal, ProjectConfig, ExpenseCategory } from '../types';

const RECORDS_KEY = 'jinri_records';
const GOAL_KEY = 'jinri_goal';
const PROJECTS_KEY = 'jinri_projects';
const EXPENSE_CATEGORIES_KEY = 'jinri_expense_categories';

const DEFAULT_PROJECTS: ProjectConfig[] = [
  { id: '1', name: '基础理疗', amount: 50 },
  { id: '2', name: '特约推拿', amount: 80 },
  { id: '3', name: '专业采耳', amount: 40 },
];

const DEFAULT_EXPENSES: ExpenseCategory[] = [
  { id: 'e1', name: '餐饮美食' },
  { id: 'e2', name: '交通出行' },
  { id: 'e3', name: '日常用品' },
  { id: 'e4', name: '房租房贷' },
];

export const storage = {
  getRecords: (): RecordEntry[] => {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveRecord: (entry: RecordEntry) => {
    const records = storage.getRecords();
    records.unshift(entry);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },
  deleteRecord: (id: string) => {
    const records = storage.getRecords().filter(r => r.id !== id);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },
  getGoal: (): DreamGoal | null => {
    const data = localStorage.getItem(GOAL_KEY);
    return data ? JSON.parse(data) : null;
  },
  saveGoal: (goal: DreamGoal) => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
  },
  getProjects: (): ProjectConfig[] => {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : DEFAULT_PROJECTS;
  },
  saveProjects: (projects: ProjectConfig[]) => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },
  getExpenseCategories: (): ExpenseCategory[] => {
    const data = localStorage.getItem(EXPENSE_CATEGORIES_KEY);
    return data ? JSON.parse(data) : DEFAULT_EXPENSES;
  },
  saveExpenseCategories: (categories: ExpenseCategory[]) => {
    localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(categories));
  },
  clearAll: () => {
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(GOAL_KEY);
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(EXPENSE_CATEGORIES_KEY);
  }
};
