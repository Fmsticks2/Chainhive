
export interface VoiceCommand {
  transcript: string;
  confidence: number;
  intent: 'analyze' | 'price' | 'portfolio' | 'alert' | 'unknown';
  entities: {
    wallet?: string;
    token?: string;
    amount?: number;
    action?: string;
  };
}

export class VoiceService {
  private static instance: VoiceService;
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private subscribers: ((command: VoiceCommand) => void)[] = [];

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        const command = this.parseVoiceCommand(transcript, confidence);
        this.notifySubscribers(command);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.recognition || this.isListening) {
        resolve(false);
        return;
      }

      try {
        this.recognition.start();
        this.isListening = true;
        resolve(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        resolve(false);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  private parseVoiceCommand(transcript: string, confidence: number): VoiceCommand {
    const lowerTranscript = transcript.toLowerCase();
    const command: VoiceCommand = {
      transcript,
      confidence,
      intent: 'unknown',
      entities: {}
    };

    // Analyze wallet addresses
    if (lowerTranscript.includes('analyze') || lowerTranscript.includes('analyse')) {
      command.intent = 'analyze';
      
      // Extract wallet address patterns
      const walletMatch = transcript.match(/(0x[a-fA-F0-9]{40}|r[a-zA-Z0-9]{25,34})/);
      if (walletMatch) {
        command.entities.wallet = walletMatch[1];
      }
    }
    
    // Price queries
    else if (lowerTranscript.includes('price') || lowerTranscript.includes('cost')) {
      command.intent = 'price';
      
      // Extract token symbols
      const tokenPatterns = [
        /\b(ethereum|eth)\b/i,
        /\b(bitcoin|btc)\b/i,
        /\b(polygon|matic)\b/i,
        /\b(chainlink|link)\b/i,
        /\b(usd\s?coin|usdc)\b/i
      ];
      
      for (const pattern of tokenPatterns) {
        const match = transcript.match(pattern);
        if (match) {
          command.entities.token = this.normalizeToken(match[1]);
          break;
        }
      }
    }
    
    // Portfolio queries
    else if (lowerTranscript.includes('portfolio') || lowerTranscript.includes('balance')) {
      command.intent = 'portfolio';
    }
    
    // Alert management
    else if (lowerTranscript.includes('alert') || lowerTranscript.includes('notification')) {
      command.intent = 'alert';
      
      // Extract action
      if (lowerTranscript.includes('create') || lowerTranscript.includes('set')) {
        command.entities.action = 'create';
      } else if (lowerTranscript.includes('delete') || lowerTranscript.includes('remove')) {
        command.entities.action = 'delete';
      } else if (lowerTranscript.includes('list') || lowerTranscript.includes('show')) {
        command.entities.action = 'list';
      }
      
      // Extract price thresholds
      const priceMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:dollars?|\$)/i);
      if (priceMatch) {
        command.entities.amount = parseFloat(priceMatch[1]);
      }
    }

    return command;
  }

  private normalizeToken(token: string): string {
    const tokenMap: { [key: string]: string } = {
      'ethereum': 'ETH',
      'eth': 'ETH',
      'bitcoin': 'BTC',
      'btc': 'BTC',
      'polygon': 'MATIC',
      'matic': 'MATIC',
      'chainlink': 'LINK',
      'link': 'LINK',
      'usd coin': 'USDC',
      'usdc': 'USDC'
    };

    return tokenMap[token.toLowerCase()] || token.toUpperCase();
  }

  subscribe(callback: (command: VoiceCommand) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(command: VoiceCommand): void {
    this.subscribers.forEach(callback => callback(command));
  }

  // Text-to-speech for responses
  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
