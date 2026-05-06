import axios from 'axios';
import { RecordEntry, DreamGoal, ProjectConfig, ExpenseCategory } from '../types';

// In WeChat Cloud Run, the frontend is served from the same origin as the API
const api = axios.create({
  baseURL: '/api',
});

export const apiService = {
  async getRecords(): Promise<RecordEntry[]> {
    const res = await api.get('/records');
    return res.data;
  },

  async saveRecord(record: RecordEntry): Promise<void> {
    await api.post('/records', record);
  },

  async deleteRecord(id: string): Promise<void> {
    await api.delete(`/records/${id}`);
  },

  async getGoal(): Promise<DreamGoal | null> {
    const res = await api.get('/goal');
    return res.data;
  },

  async saveGoal(goal: DreamGoal): Promise<void> {
    await api.post('/goal', goal);
  },

  async getProjects(): Promise<ProjectConfig[]> {
    const res = await api.get('/projects');
    return res.data;
  },

  async saveProjects(projects: ProjectConfig[]): Promise<void> {
    await api.post('/projects', { projects });
  },

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const res = await api.get('/expense-categories');
    return res.data;
  },

  async saveExpenseCategories(categories: ExpenseCategory[]): Promise<void> {
    await api.post('/expense-categories', { categories });
  }
};
