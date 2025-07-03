# Air University AI Guide

![AU Guide Screenshot](/Assets/SS.png)

## Overview

The **AU Guide** is an intelligent, feature-rich chatbot designed to assist students and applicants of Air University. Built with a modern tech stack and powered by a large language model, this application provides instant, helpful information on admissions, academic programs, fee structures, and scholarships.

This project was developed by **Anas Raheem** to create a seamless, user-friendly experience for the Air University community, making crucial information more accessible.

---

## ✨ Key Features

* **Conversational AI:** Engage in natural language conversations to get answers about university-related topics.
* **Merit Predictor:** An interactive tool that calculates a user's admission aggregate based on their academic scores and provides an analysis of their admission chances for various programs.
* **GPA Calculator:** A handy utility for students to quickly calculate their Grade Point Average.
* **Human-Like Voice Interaction:**
    * **Voice-to-Text:** Use your voice to ask questions.
    * **Text-to-Speech:** Listen to the AI's responses in a high-quality, natural-sounding voice.
    * **Voice Selection:** Choose from a list of available premium voices in your browser.
* **Dynamic Light & Dark Modes:** A sleek, modern UI with a theme toggle that saves user preference in their browser.
* **Branded UI:** A professional design inspired by Air University's official branding, complete with the university logo as a subtle background watermark.
* **Fully Responsive:** The interface is designed to work beautifully on desktop, tablet, and mobile devices.

---

## 🛠️ Technologies Used

* **Frontend:** HTML5, CSS3, TypeScript
* **Language Model API:** [Groq](https://groq.com/) for fast and intelligent responses.
* **Core Technologies:**
    * **Web Speech API:** For all voice recognition (Speech-to-Text) and synthesis (Text-to-Speech) functionalities.
    * **TypeScript:** For type safety and robust, scalable code.
    * **CSS Variables:** For dynamic and easy-to-manage theme switching (Light/Dark mode).
    * **Flexbox & Grid:** For modern, responsive layouts.
* **Build Tool:** `tsc` (TypeScript Compiler)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) installed on your machine to use `npm`.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/anasraheemdev/aubot](https://github.com/anasraheemdev/aubot)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd au-guide
    ```
3.  **Install dependencies:**
    *(This project has no external npm dependencies in its current state, but this step is good practice.)*
    ```sh
    npm install
    ```
4.  **Set up your API Key:**
    * Open the `config.ts` file.
    * Replace the placeholder `GROQ_API_KEY` with your own key from [Groq](https://console.groq.com/keys).
    ```typescript
    export const config = {
        GROQ_API_KEY: "YOUR_API_KEY_HERE",
        GROQ_MODEL: "llama3-8b-8192"
    };
    ```

### Running the Application

1.  **Compile the TypeScript code:**
    ```sh
    npm run build
    ```
    This command will compile all `.ts` files into JavaScript and place them in the `/dist` directory.

2.  **Open `index.html`:**
    * Simply open the `index.html` file in your favorite web browser. You can do this by double-clicking the file or by using a live server extension in your code editor (like Live Server for VS Code).

---

## 👤 About the Creator

This application was designed and developed by **Anas Raheem**.

* **LinkedIn:** [https://www.linkedin.com/in/anasraheem/](https://www.linkedin.com/in/anasraheem/)
* **Company:** [Synovate](https://www.synovate.pk)

Feel free to reach out with any questions or feedback!
