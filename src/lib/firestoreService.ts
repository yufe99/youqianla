import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  getDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { RecordEntry, DreamGoal, ProjectConfig } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  // Records
  async saveRecord(record: RecordEntry) {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/records/${record.id}`;
    try {
      await setDoc(doc(db, path), { ...record, userId: auth.currentUser.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteRecord(recordId: string) {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/records/${recordId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeRecords(callback: (records: RecordEntry[]) => void) {
    if (!auth.currentUser) return () => {};
    const path = `users/${auth.currentUser.uid}/records`;
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => doc.data() as RecordEntry);
      callback(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  // Goals
  async saveGoal(goal: DreamGoal) {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/goals/current`;
    try {
      await setDoc(doc(db, path), { ...goal, userId: auth.currentUser.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getGoal(): Promise<DreamGoal | null> {
    if (!auth.currentUser) return null;
    const path = `users/${auth.currentUser.uid}/goals/current`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? (docSnap.data() as DreamGoal) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  subscribeGoal(callback: (goal: DreamGoal | null) => void) {
    if (!auth.currentUser) return () => {};
    const path = `users/${auth.currentUser.uid}/goals/current`;
    return onSnapshot(doc(db, path), (docSnap) => {
      callback(docSnap.exists() ? (docSnap.data() as DreamGoal) : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  // Projects
  async saveProjects(projects: ProjectConfig[]) {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    try {
      // For simplicity, we just save each project in the collection
      for (const project of projects) {
        const path = `users/${userId}/projects/${project.id}`;
        await setDoc(doc(db, path), { ...project, userId });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/projects');
    }
  },

  subscribeProjects(callback: (projects: ProjectConfig[]) => void) {
    if (!auth.currentUser) return () => {};
    const path = `users/${auth.currentUser.uid}/projects`;
    return onSnapshot(collection(db, path), (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as ProjectConfig);
      callback(projects);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
};
