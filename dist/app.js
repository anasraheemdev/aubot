import { GroqClient } from "./groq.js";
import { createMessageElement, sanitizeHTML } from "./utils.js";
import { universityTopics, getSystemPrompt } from "./air-university-guide.js";
import { calculateAggregate, predictAdmissionChance } from "./merit-predictor.js";
import { calculateGPA } from "./gpa-calculator.js";
import { config } from './config.js';
import { VoiceFeature } from './voice.js';
let currentState = 'idle';
let meritPredictionData = {};
let gpaSubjects = [];
// --- CHATBOT CLASS ---
class UniversityChatbot {
    constructor(apiKey, model) {
        this.chatMessages = [];
        this.isSpeechEnabled = false;
        this.client = new GroqClient(apiKey, model);
        // --- INITIALIZE DOM ELEMENTS ---
        this.messagesContainer = document.getElementById("messages-container");
        this.messageInput = document.getElementById("message-input");
        this.sendButton = document.getElementById("send-button");
        this.topicSelector = document.getElementById("topic-selector");
        this.loadingIndicator = document.getElementById("loading-indicator");
        this.voiceButton = document.getElementById("voice-button");
        this.speechButton = document.getElementById("speech-button");
        this.voiceStatusElement = document.getElementById("voice-status");
        this.voiceSelect = document.getElementById("voice-select");
        this.themeToggle = document.getElementById("theme-toggle");
        // --- INITIALIZE VOICE FEATURE ---
        this.voiceFeature = new VoiceFeature((message) => {
            this.messageInput.value = message;
            this.handleUserInput();
        }, (status, isListening) => {
            this.voiceStatusElement.textContent = status;
            this.voiceStatusElement.classList.toggle('listening', isListening);
            this.voiceButton.classList.toggle('active', isListening);
        });
        this.initializeChat();
        this.setupEventListeners();
    }
    initializeChat() {
        this.chatMessages = [{ role: "system", content: getSystemPrompt() }];
        this.populateTopics();
        this.addBotMessage("Welcome to the **Air University AI Guide**! I was created by Anas Raheem to help you. How can I assist you today?");
        this.applyInitialTheme();
    }
    setupEventListeners() {
        this.sendButton.addEventListener("click", () => this.handleUserInput());
        this.messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter")
            this.handleUserInput(); });
        this.voiceButton.addEventListener('click', () => this.voiceFeature.startListening());
        this.speechButton.addEventListener('click', () => {
            this.isSpeechEnabled = !this.isSpeechEnabled;
            this.speechButton.classList.toggle('active', this.isSpeechEnabled);
        });
        // --- THEME TOGGLE EVENT LISTENER ---
        this.themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            this.updateThemeIcon(isLight);
        });
        // Listen for the custom event when voices are loaded
        window.addEventListener('voicesloaded', (e) => {
            const voices = e.detail;
            this.voiceSelect.innerHTML = '';
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.voiceURI;
                option.textContent = `${voice.name} (${voice.lang})`;
                this.voiceSelect.appendChild(option);
            });
            if (this.voiceSelect.value) {
                this.voiceFeature.setVoice(this.voiceSelect.value);
            }
        });
        this.voiceSelect.addEventListener('change', () => {
            this.voiceFeature.setVoice(this.voiceSelect.value);
        });
        // Sidebar and topic event listeners...
        document.getElementById('sidebar-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.add('show'));
        document.getElementById('close-sidebar').addEventListener('click', () => document.getElementById('sidebar').classList.remove('show'));
        this.topicSelector.addEventListener("click", (e) => {
            const topicItem = e.target.closest(".topic-item");
            if (topicItem?.dataset.topic) {
                const topic = universityTopics.find(t => t.id === topicItem.dataset.topic);
                if (topic) {
                    this.messageInput.value = `Tell me about ${topic.name}`;
                    this.handleUserInput();
                }
            }
        });
        document.getElementById('quick-actions').addEventListener('click', (e) => {
            const actionItem = e.target.closest(".topic-item");
            if (actionItem?.dataset.action === 'predict-merit')
                this.startMeritPrediction();
            else if (actionItem?.dataset.action === 'calculate-gpa')
                this.startGpaCalculation();
        });
    }
    applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const isLight = savedTheme === 'light';
        document.body.classList.toggle('light-mode', isLight);
        this.updateThemeIcon(isLight);
    }
    updateThemeIcon(isLight) {
        this.themeToggle.innerHTML = isLight ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>';
    }
    async handleUserInput() {
        const userMessage = this.messageInput.value.trim();
        if (!userMessage)
            return;
        this.addUserMessage(userMessage);
        this.messageInput.value = "";
        if (userMessage.toLowerCase() === '/predict') {
            this.startMeritPrediction();
            return;
        }
        if (userMessage.toLowerCase() === '/gpa') {
            this.startGpaCalculation();
            return;
        }
        if (currentState === 'awaiting_merit_program')
            this.handleMeritPredictionFlow(userMessage);
        else if (currentState === 'awaiting_merit_scores')
            this.handleMeritPredictionFlow(userMessage);
        else if (currentState === 'awaiting_gpa_input')
            this.handleGpaFlow(userMessage);
        else
            this.getLLMResponse(userMessage);
    }
    startMeritPrediction() {
        currentState = 'awaiting_merit_program';
        meritPredictionData = {};
        this.addBotMessage("Of course. **Which BS program are you interested in?** (e.g., CS, Engineering, Cyber Security)");
    }
    startGpaCalculation() {
        currentState = 'awaiting_gpa_input';
        gpaSubjects = [];
        this.addBotMessage("Let's calculate your GPA. Please provide each subject on a new line in the format: **`Grade, CreditHours`**\n\nFor example:\n`A, 3`\n`B+, 3`\n\nType **`done`** when you are finished.");
    }
    handleMeritPredictionFlow(input) {
        if (currentState === 'awaiting_merit_program') {
            meritPredictionData.program = input;
            currentState = 'awaiting_merit_scores';
            this.addBotMessage(`Understood. For ${meritPredictionData.program}, please provide your scores in this format:\n\n**SSC Percentage, HSSC-1 Percentage, Expected Test Score / 100**\n\nFor example: \`85.5, 90.1, 75\``);
        }
        else if (currentState === 'awaiting_merit_scores') {
            const scores = input.split(',').map(s => parseFloat(s.trim()));
            if (scores.length === 3 && !scores.some(isNaN)) {
                const [ssc, hssc, test] = scores;
                const aggregate = calculateAggregate(ssc, hssc, test);
                const analysis = predictAdmissionChance(aggregate, meritPredictionData.program);
                this.addBotMessage(analysis);
                currentState = 'idle';
            }
            else {
                this.addBotMessage("The format seems incorrect. Please provide the three scores separated by commas.");
            }
        }
    }
    handleGpaFlow(input) {
        if (input.toLowerCase() === 'done') {
            if (gpaSubjects.length === 0) {
                this.addBotMessage("No subjects entered. Please provide them in the `Grade, CreditHours` format.");
                return;
            }
            const result = calculateGPA(gpaSubjects);
            this.addBotMessage(result);
            currentState = 'idle';
        }
        else {
            const parts = input.split(',').map(p => p.trim());
            const grade = parts[0];
            const creditHours = parseInt(parts[1], 10);
            if (parts.length === 2 && grade && !isNaN(creditHours)) {
                gpaSubjects.push({ grade, creditHours });
                this.addBotMessage(`Added: ${grade} (${creditHours} CrHrs). Enter the next subject, or type **\`done\`**.`);
            }
            else {
                this.addBotMessage("Invalid format. Please use `Grade, CreditHours`, for example: `A-, 3`");
            }
        }
    }
    async getLLMResponse(userMessage) {
        this.loadingIndicator.style.display = "flex";
        this.chatMessages.push({ role: "user", content: userMessage });
        try {
            const response = await this.client.createChatCompletion(this.chatMessages);
            this.chatMessages.push({ role: "assistant", content: response });
            this.addBotMessage(response);
        }
        catch (error) {
            console.error("Error getting response:", error);
            this.addBotMessage("My apologies, but I seem to be having trouble connecting to my core systems. Please try again in a moment.");
        }
        finally {
            this.loadingIndicator.style.display = "none";
        }
    }
    addUserMessage(message) {
        const messageElement = createMessageElement(sanitizeHTML(message), true);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    addBotMessage(message) {
        const messageElement = createMessageElement(message, false);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        if (this.isSpeechEnabled) {
            this.voiceFeature.speak(message);
        }
    }
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    populateTopics() {
        this.topicSelector.innerHTML = '';
        universityTopics.forEach((topic) => {
            const topicItem = document.createElement("div");
            topicItem.className = "topic-item";
            topicItem.setAttribute("data-topic", topic.id);
            topicItem.innerHTML = `
            <div class="topic-item-header">
                <i class="bi bi-check-circle"></i>
                <h5>${topic.name}</h5>
            </div>
            <p>${topic.description}</p>
        `;
            this.topicSelector.appendChild(topicItem);
        });
    }
}
// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    new UniversityChatbot(config.GROQ_API_KEY, config.GROQ_MODEL);
});
