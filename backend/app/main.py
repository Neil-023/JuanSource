from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .fact_checker import run_fact_check

app = FastAPI(title="JuanSource API")

# Enable CORS so React (running on a different port) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React/Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model to define the structure of the request body
class ClaimRequest(BaseModel):
    claim: str

@app.post("/fact-check")
async def fact_check_endpoint(request: ClaimRequest):
    return run_fact_check(request.claim)
