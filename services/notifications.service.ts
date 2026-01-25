// notifications.service.ts - FIXED
import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  private notificationId = 1; // Start with small integer

  async requestPermissions(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  async showBasicNotification(title: string, body: string): Promise<void> {
    // Use sequential integers instead of Date.now()
    const id = this.notificationId++;
    if (this.notificationId > 2147483647) { // Java int max
      this.notificationId = 1; // Reset if we hit max
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: id, // ✅ Small integer that Java can handle
          title: title,
          body: body,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
        }
      ]
    });
  }

  async showTTSNotification(text: string): Promise<void> {
    await this.showBasicNotification(
      'TTS Complete',
      `Finished speaking: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
    );
  }

  async clearAll(): Promise<void> {
    await LocalNotifications.cancel({ notifications: [] });
  }
}

export const notificationService = new NotificationService();
