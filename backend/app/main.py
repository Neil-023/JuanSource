from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from .fact_checker import run_fact_check

app = FastAPI(title="JuanSource API")

# Enable CORS so React (running on a different port) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model to define the structure of the request body
class ClaimRequest(BaseModel):
    claim: str

class FactCheckResponse(BaseModel):
    classification: str
    reasoning: str
    evidence: List[str]
    raw: str

@app.post("/fact-check", response_model=FactCheckResponse)
async def fact_check_endpoint(request: ClaimRequest):
    result = run_fact_check(request.claim)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
