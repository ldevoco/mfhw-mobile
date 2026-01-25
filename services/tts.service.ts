import { HumeClient } from 'hume';
import { Preferences } from '@capacitor/preferences';
import { useRuntimeConfig } from '#imports';

export class TTSService {
  private apiKey: string = '';
  private humeClient: HumeClient | null = null;

  async initialize() {
    const { value } = await Preferences.get({ key: 'HUME_API_KEY' });
    this.apiKey = value || '';
    if (this.apiKey) {
      this.humeClient = new HumeClient({ apiKey: this.apiKey });
    }
  }

  async setApiKey(key: string) {
    const { public: { humeKey } } = useRuntimeConfig();

    this.apiKey = humeKey;
    await Preferences.set({ key: 'HUME_API_KEY', value: this.apiKey });
    this.humeClient = new HumeClient({ apiKey: this.apiKey });
  }

  async speakText(text: string): Promise<string> {
    if (!this.humeClient) {
      throw new Error('Hume client not initialized');
    }

    try {
      const stream = await this.humeClient.tts.synthesizeJsonStreaming({
        utterances: [{
          text: text,
          voice: { name: 'Gamma', provider: 'CUSTOM_VOICE' }
        }],
        stripHeaders: true,
        version: "2"
      });

      // Collect all audio chunks
      const audioChunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        if (chunk.type === 'audio') {
          const buffer = Uint8Array.from(atob(chunk.audio), c => c.charCodeAt(0));
          audioChunks.push(buffer);
        }
      }

      // Combine chunks and create data URL
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const base64Audio = btoa(String.fromCharCode(...combined));
      return `data:audio/wav;base64,${base64Audio}`;

    } catch (error) {
      console.error('Hume TTS Error:', error);
      throw error;
    }
  }

  speakNative(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const ttsService = new TTSService();
