import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import GoogleSearchAPIWrapper
from langchain_core.tools import Tool
from langchain_core.prompts import PromptTemplate

load_dotenv()

# I. The Reasoning Engine (LLM)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.1,
)

# II. The Retrieval Tool (Google Search)
search = GoogleSearchAPIWrapper()
google_search_tool = Tool(
    name="Google Search",
    description="A tool for retrieving real-time, external facts, and evidence from the internet to fact-check a claim. Returns a list of search results with titles, links, and snippets.",
    func=lambda query: search.results(query, num_results=10)
)

# III. The Reasoning Prompt Template
RAG_PROMPT_TEMPLATE = """
**FACT-CHECKER ASSIGNMENT: RAG Fake News Detector**

You are an objective, expert fact-checker. Your task is to analyze a user's query against
the real-time evidence retrieved from Google Search.

**1. QUERY/CLAIM TO VERIFY:**
{query}

**2. RETRIEVED EVIDENCE (Search Results):**
{search_results}

**INSTRUCTIONS FOR REASONING:**
A. **Classification:** Determine the veracity of the QUERY.
   - If the search results overwhelmingly confirm the claim, classify it as **REAL**.
   - If the search results **contradict** or **cannot find any corroborating information** for the claim, classify it as **FAKE**.
B. **Reasoning:** Your explanation must explicitly reference the information found in the **RETRIEVED EVIDENCE** section.
C. **Evidence Sourcing:** After writing your reasoning, create a list of the source **links** (URLs) from the **RETRIEVED EVIDENCE** that directly support your conclusion.

**FINAL OUTPUT FORMAT:**
Classification: [REAL or FAKE]
Reasoning: [Provide a concise, detailed, and evidence-based explanation for your classification.]
Evidence: [
  "https://www.source-link-1.com/article",
  "https://www.source-link-2.com/news"
]
"""
RAG_PROMPT = PromptTemplate.from_template(RAG_PROMPT_TEMPLATE)

def run_fact_check(claim: str):
    print(f"1. Verifying Claim: '{claim}'")
    try:
        print("2. Performing Google Search...")
        search_results = google_search_tool.run(claim)
        print("3. Evidence retrieved.")
    except Exception as e:
        print(f"Error during Google Search: {e}")
        return {"error": "Could not perform Google Search. Please check your GOOGLE_API_KEY and GOOGLE_CSE_ID."}

    try:
        final_prompt = RAG_PROMPT.format(query=claim, search_results=search_results)
        print("4. Sending evidence to Gemini for Reasoning...")
        response = llm.invoke(final_prompt)
        return {"result": response.content}
    except Exception as e:
        print(f"Error during Gemini Reasoning: {e}")
        return {"error": "Could not get reasoning from AI model. Please check your GEMINI_API_KEY."}