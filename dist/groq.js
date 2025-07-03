export class GroqClient {
    constructor(apiKey, model = "meta-llama/llama-4-scout-17b-16e-instruct") {
        this.baseUrl = 'https://api.groq.com/openai/v1';
        this.apiKey = apiKey;
        this.model = model;
    }
    async createChatCompletion(messages) {
        try {
            console.log('Making API request to Groq with model:', this.model);
            const requestBody = {
                model: this.model,
                messages: messages.map(msg => ({
                    role: this.mapRole(msg.role).toLowerCase(),
                    content: msg.content
                })),
                temperature: 0.7,
                max_tokens: 1000
            };
            console.log('Request payload:', JSON.stringify(requestBody));
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            if (!response.ok) {
                return `Error ${response.status}: ${responseText}`;
            }
            try {
                const data = JSON.parse(responseText);
                if (!data.choices || data.choices.length === 0) {
                    return "The API returned an empty response. Please check your model name and API key.";
                }
                return data.choices[0].message.content;
            }
            catch (parseError) {
                console.error('Error parsing JSON response:', parseError);
                return `Error parsing response: ${responseText.substring(0, 100)}...`;
            }
        }
        catch (error) {
            console.error('Error calling Groq API:', error);
            return `API Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
        }
    }
    mapRole(role) {
        switch (role.toLowerCase()) {
            case 'user':
                return 'user';
            case 'assistant':
                return 'assistant';
            case 'system':
                return 'system';
            default:
                return 'user';
        }
    }
}
