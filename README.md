![cover](images/cover.png)
juansource (short for Juan’s Source of Truth) is a fact-checking web application designed to help Filipinos identify misinformation and fake news online. Built by students under the name Team AltTab, the project aims to make truth accessible to every Juan — simple, fast, and grounded in verified sources. 
> *In a sea of misinformation, juansource stands as a small voice that answers with truth.*

This project uses **FastAPI** for the backend and **React (Vite + TailwindCSS)** for the frontend.  
It integrates **LangChain**, **Google Generative AI**, and **Google Search API** for real-time fact-checking.

---
# 📋 Features
- 💬 Fact-Checking Chatbot Interface — Conversational verification of claims and headlines.
- 🔍 Real-Time Data Retrieval — Integrates Google Custom Search for fresh, source-backed results.
- 🧩 AI-Powered Reasoning — Uses Gemini 2.5 Flash (via LangChain) for classification and explanation.
- 🌐 Accessible Frontend — Built with React + Tailwind for clean, fast, and responsive use.
- 🛠️ Lightweight Backend — FastAPI handles API requests and RAG pipeline efficiently.

---

## 🖥️ Backend Setup

### 
1️⃣ Navigate to the backend folder
```
cd backend
```
2️⃣ Create a virtual environment
```
python -m venv venv
```
3️⃣ Activate the virtual environment
```
.\venv\Scripts\Activate.ps1
```
4️⃣ Install dependencies
```
pip install fastapi uvicorn python-dotenv
pip install langchain langchain-google-genai langchain-community
pip install google-api-python-client
```
5️⃣ Create a .env file inside the backend folder
```
Create a new file named .env and add your Google credentials

GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
```
6️⃣ Run the backend server
```
uvicorn app.main:app --reload --port 8000
```
Your backend will now run on: http://127.0.0.1:8000

## 💡 Frontend Setup 

###
1️⃣ Create the frontend project
```
npm create vite@latest frontend -- --template react
```
2️⃣ Go to the frontend folder
```
cd frontend
```
3️⃣ Install dependencies
```
npm install
```
4️⃣ Install TailwindCSS
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
5️⃣ Run the frontend
```
npm run dev
```
Your frontend will now be live on: http://localhost:5173

---

# 🚀 How It Works
1️⃣ User enters a claim or headline (e.g., “Apples are orange.”)

2️⃣ juansource fetches relevant snippets from Google Search.

3️⃣ The system analyzes the context using Gemini 2.5 Flash and LangChain.

4️⃣ Returns a classification (True / False / Uncertain) with reasoning and citations.

---

# 💜 Our Vision

To make truth accessible, inclusive, and transparent for every Filipino.
In the future, juansource aims to:

- Support Filipino and regional languages
- Monitor and combat misinformation trends in real-time
- Partner with media and educational institutions to promote digital literacy

---

### 💻 Team AltTab
*Built by students, for every Juan.* 💜 

- [@paulo10011](https://github.com/paulo10011) 
- [@CreampuffWasEatenBySora](https://github.com/CreampuffWasEatenBySora) 
- [@Neil-023](https://github.com/Neil-023)   
- [@A-tio](https://github.com/A-tio) 
- [@alhtb](https://github.com/alhtb) 
  


