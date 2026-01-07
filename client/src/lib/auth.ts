import { db } from './db';
import type { User } from './types';

class AuthService {
  private currentUser: User | null = null;
  private readonly SESSION_KEY = 'inventory_session_user';

  constructor() {
    const saved = localStorage.getItem(this.SESSION_KEY);
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  }

  async login(username: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = db.getUsers().find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.SESSION_KEY);
    window.location.reload();
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

export const auth = new AuthService();
