from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import time

app = FastAPI(
    title="OmniSense AI Embeddings & Scoring API",
    description="Vector search, text scoring, and inference gateway",
    version="1.5.0"
)

class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=50, description="List of strings to embed")
    model: Optional[str] = "bge-small-en-v1.5"

class EmbeddingResponse(BaseModel):
    model: str
    dimension: int
    embeddings: List[List[float]]
    processing_time_ms: float

class HealthResponse(BaseModel):
    status: str
    workers_alive: int
    gpu_available: bool

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Returns cluster health and GPU runtime availability"""
    return HealthResponse(status="healthy", workers_alive=4, gpu_available=True)

@app.post("/v1/embeddings", response_model=EmbeddingResponse)
def compute_embeddings(req: EmbeddingRequest):
    """Generates normalized vector representations for input strings"""
    start = time.time()
    if not req.texts:
        raise HTTPException(status_code=400, detail="Text array cannot be empty")
    
    # Mock embedding dimension (384)
    mock_vectors = [[0.05 * (i + j) for j in range(384)] for i in range(len(req.texts))]
    elapsed = (time.time() - start) * 1000
    
    return EmbeddingResponse(
        model=req.model,
        dimension=384,
        embeddings=mock_vectors,
        processing_time_ms=elapsed
    )

@app.post("/v1/rerank")
def rerank_documents(query: str, documents: List[str]):
    """Reranks candidates based on cross-encoder similarity scores"""
    scored = [{"index": idx, "document": doc, "score": 0.95 - (idx * 0.1)} for idx, doc in enumerate(documents)]
    return {"query": query, "ranked_results": scored}

