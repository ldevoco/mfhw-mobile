import { Preferences } from '@capacitor/preferences';
import { useRuntimeConfig } from '#imports';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}


class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  async initialize() {
    // Load stored auth data
    const [{ value: token }, { value: userData }] = await Promise.all([
      Preferences.get({ key: 'auth_token' }),
      Preferences.get({ key: 'user_data' })
    ]);

    if (token && userData) {
      this.token = token;
      this.user = JSON.parse(userData);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('this is happening at least');
    const { public: { apiBase, user: runtimeUser, password: runtimePassword } } = useRuntimeConfig();

    console.log('AHH');

    const response = await $fetch<AuthResponse>('http://localhost:3001' + '/api/login-proxy', {
      method: 'POST',
      body: { email: runtimeUser, password: runtimePassword }
    });

    // Store securely
    await Promise.all([
      Preferences.set({ key: 'auth_token', value: response.token }),
      Preferences.set({ key: 'user_data', value: JSON.stringify(response.user) }),
      Preferences.set({ key: 'refresh_token', value: response.refreshToken })
    ]);

    this.token = response.token;
    this.user = response.user;

    return response;
  }

  async logout(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: 'auth_token' }),
      Preferences.remove({ key: 'user_data' }),
      Preferences.remove({ key: 'refresh_token' })
    ]);

    this.token = null;
    this.user = null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  // Auto-refresh token
  async refreshToken(): Promise<string> {
    const { value: refreshToken } = await Preferences.get({ key: 'refresh_token' });
    if (!refreshToken) throw new Error('No refresh token');

    const response = await $fetch<{ token: string }>(apiBase + '/api/test', {
      method: 'POST',
      body: { refreshToken }
    });

    await Preferences.set({ key: 'auth_token', value: response.token });
    this.token = response.token;

    return response.token;
  }
}

export const authService = new AuthService();
