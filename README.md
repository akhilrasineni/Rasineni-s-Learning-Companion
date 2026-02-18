
# 🎓 Rasineni's Learning Companion

An advanced AI-powered educational ecosystem designed to empower students through interactive voice sessions, visual concept generation, personalized quizzes, and AI-driven roadmaps.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css)
![Gemini](https://img.shields.io/badge/Google-Gemini_API-8E75B2.svg?logo=google-gemini)

## 🚀 Key Features

- **Dashboard (Coach):** Daily motivation, progress tracking, and personalized learning advice.
- **AI Researcher:** Search-grounded deep dives into any topic with verified source citations.
- **Voice Companion:** Real-time, low-latency audio conversations for natural tutoring sessions.
- **Visual Studio:** Transform complex abstract theories into instructional diagrams and sketches.
- **Learning Plans:** Dynamic roadmap generator with curated reference links and milestone tracking.
- **Knowledge Mastery:** Concept-based assessments with adaptive feedback and score analytics.
- **Study Notes:** Quick AI-summarization of long-form study materials.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS (Modern Glassmorphism UI)
- **AI Engine:** Google Gemini API (`gemini-3-flash-preview`, `gemini-2.5-flash-native-audio-preview`)
- **Media:** Veo for Video Generation, Nano Banana for Image generation.
- **State/Storage:** Local Storage for persistent user profiles and progress tracking.

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (Obtain one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rasinenis-learning-companion.git
   cd rasinenis-learning-companion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add your API key: `API_KEY=your_key_here`

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `components/`: Modular React components for each tool.
- `services/`: API integration (Gemini, storage logic).
- `types.ts`: Centralized TypeScript interfaces.
- `App.tsx`: Main routing and layout engine.
- `index.html`: Entry point and Tailwind/Font loading.

## ⚖️ License

MIT License - feel free to use and adapt this for educational purposes!
