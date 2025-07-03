export class VoiceFeature {
    constructor(messageCallback, statusCallback) {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.voices = [];
        this.selectedVoice = null;
        this.messageCallback = messageCallback;
        this.statusCallback = statusCallback;
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            this.recognition = new SpeechRecognitionAPI();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            // Event Handlers
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageCallback(transcript);
            };
            this.recognition.onerror = (event) => {
                console.error('Recognition Error:', event.error);
                this.statusCallback(`Error: ${event.error}`, false);
            };
            this.recognition.onstart = () => this.statusCallback('Listening...', true);
            this.recognition.onend = () => this.statusCallback('', false);
        }
        else {
            console.warn('Speech Recognition not supported in this browser');
            this.statusCallback('Voice input not supported.', false);
        }
        // Load voices
        this.loadVoices();
    }
    loadVoices() {
        // Voices may load asynchronously.
        const load = () => {
            const allVoices = this.synthesis.getVoices();
            if (allVoices.length > 0) {
                // Prioritize high-quality, English voices
                this.voices = allVoices.filter(voice => voice.lang.startsWith('en'))
                    .sort((a, b) => {
                    const aIsNatural = a.name.includes('Natural') || a.name.includes('Google');
                    const bIsNatural = b.name.includes('Natural') || b.name.includes('Google');
                    if (aIsNatural && !bIsNatural)
                        return -1;
                    if (!aIsNatural && bIsNatural)
                        return 1;
                    return 0;
                });
                this.selectedVoice = this.voices[0] || null;
                // Notify the app that voices are ready
                window.dispatchEvent(new CustomEvent('voicesloaded', { detail: this.voices }));
            }
        };
        if (this.synthesis.getVoices().length > 0) {
            load();
        }
        else {
            this.synthesis.onvoiceschanged = load;
        }
    }
    setVoice(voiceURI) {
        const voice = this.voices.find(v => v.voiceURI === voiceURI);
        if (voice) {
            this.selectedVoice = voice;
        }
    }
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
            }
            catch (error) {
                console.error('Error starting recognition:', error);
                this.isListening = false;
            }
        }
    }
    speak(text) {
        if (!this.synthesis || !this.selectedVoice)
            return;
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
