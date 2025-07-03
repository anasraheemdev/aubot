// Type definitions for the Web Speech API to ensure type safety
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

export class VoiceFeature {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis = window.speechSynthesis;
  private isListening = false;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  // Callbacks to communicate with the main app
  private messageCallback: (message: string) => void;
  private statusCallback: (status: string, active: boolean) => void;

  constructor(
    messageCallback: (message: string) => void,
    statusCallback: (status: string, active: boolean) => void
  ) {
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      // Event Handlers
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        this.messageCallback(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Recognition Error:', event.error);
        this.statusCallback(`Error: ${event.error}`, false);
      };

      this.recognition.onstart = () => this.statusCallback('Listening...', true);
      this.recognition.onend = () => this.statusCallback('', false);

    } else {
      console.warn('Speech Recognition not supported in this browser');
      this.statusCallback('Voice input not supported.', false);
    }

    // Load voices
    this.loadVoices();
  }

  private loadVoices(): void {
    // Voices may load asynchronously.
    const load = () => {
      const allVoices = this.synthesis.getVoices();
      if (allVoices.length > 0) {
        // Prioritize high-quality, English voices
        this.voices = allVoices.filter(voice => voice.lang.startsWith('en'))
          .sort((a, b) => {
            const aIsNatural = a.name.includes('Natural') || a.name.includes('Google');
            const bIsNatural = b.name.includes('Natural') || b.name.includes('Google');
            if (aIsNatural && !bIsNatural) return -1;
            if (!aIsNatural && bIsNatural) return 1;
            return 0;
          });
        this.selectedVoice = this.voices[0] || null;
        // Notify the app that voices are ready
        window.dispatchEvent(new CustomEvent('voicesloaded', { detail: this.voices }));
      }
    };
    
    if (this.synthesis.getVoices().length > 0) {
        load();
    } else {
        this.synthesis.onvoiceschanged = load;
    }
  }

  public setVoice(voiceURI: string): void {
      const voice = this.voices.find(v => v.voiceURI === voiceURI);
      if (voice) {
          this.selectedVoice = voice;
      }
  }

  public startListening(): void {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Error starting recognition:', error);
        this.isListening = false;
      }
    }
  }

  public speak(text: string): void {
    if (!this.synthesis || !this.selectedVoice) return;

    this.synthesis.cancel(); // Stop any current speech

    // Clean up text for better speech flow
    const cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, 'Code block.')
      .replace(/<[^>]*>/g, '');

    // Split text into sentences for more natural pacing
    const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

    sentences.forEach(sentence => {
        const utterance = new SpeechSynthesisUtterance(sentence.trim());
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice?.lang || 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synthesis.speak(utterance);
    });
  }
}
