# backend/retrieve.py
import os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

# Load the embedding model globally
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def retrieve_context(
    question,
    product_id,  # CRITICAL: Added product_id to keep data isolated
    k=5,
    semantic_weight=0.7,
    keyword_weight=0.3
):
    # Paths based on the specific product ID
    index_path = f"vector_store/{product_id}_faiss_index.bin"
    chunks_path = f"vector_store/{product_id}_chunks.pkl"
    
    # If this product doesn't have any uploaded resources yet, return empty
    if not os.path.exists(index_path) or not os.path.exists(chunks_path):
        return []

    # Load product-specific FAISS index
    index = faiss.read_index(index_path)

    # Load product-specific chunks
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    # Tokenize chunks for BM25 dynamically
    tokenized_chunks = [chunk.lower().split() for chunk in chunks]
    bm25 = BM25Okapi(tokenized_chunks)

    # ===== Semantic Search =====
    query_embedding = model.encode(question)
    query_embedding = np.array([query_embedding], dtype=np.float32)

    # Make sure we don't ask for more items than exist in the index
    actual_k = min(k, len(chunks))
    if actual_k == 0:
        return []

    distances, indices = index.search(query_embedding, actual_k)

    semantic_scores = {}
    for rank, idx in enumerate(indices[0]):
        if idx == -1:  # FAISS returns -1 if there aren't enough items
            continue
        # Convert distance to similarity score
        similarity = 1 / (1 + distances[0][rank])
        semantic_scores[idx] = similarity

    # ===== Keyword Search =====
    tokenized_query = question.lower().split()
    bm25_scores = bm25.get_scores(tokenized_query)

    max_bm25 = max(bm25_scores) if len(bm25_scores) > 0 else 0
    keyword_scores = {}

    for idx, score in enumerate(bm25_scores):
        if max_bm25 > 0:
            keyword_scores[idx] = score / max_bm25

    # ===== Hybrid Score =====
    combined_scores = {}
    all_indices = set(semantic_scores.keys()) | set(keyword_scores.keys())

    for idx in all_indices:
        semantic = semantic_scores.get(idx, 0)
        keyword = keyword_scores.get(idx, 0)

        combined_scores[idx] = (
            (semantic_weight * semantic) + (keyword_weight * keyword)
        )

    # Sort descending
    ranked = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)

    # Top chunks
    retrieved_chunks = []
    for idx, score in ranked[:actual_k]:
        retrieved_chunks.append(chunks[idx])

    return retrieved_chunks