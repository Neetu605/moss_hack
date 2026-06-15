from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import os

# Load MiniLM model
model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

# MiniLM output dimension
EMBEDDING_DIM = 384


def get_embedding(text):
    """
    Generate embedding for a single text chunk.
    """

    embedding = model.encode(text)

    return np.array(embedding, dtype=np.float32)


def build_vector_store(chunks):
    """
    Build FAISS index from all chunks.
    """

    # Create FAISS index
    index = faiss.IndexFlatL2(EMBEDDING_DIM)

    vectors = []
    metadata = []

    for chunk in chunks:

        embedding = get_embedding(chunk)

        vectors.append(embedding)
        metadata.append(chunk)

    vectors = np.array(vectors)

    # Add vectors to FAISS
    index.add(vectors)

    # Create vector_store folder if not present
    os.makedirs("vector_store", exist_ok=True)

    # Save FAISS index
    faiss.write_index(
        index,
        "vector_store/faiss_index.bin"
    )

    # Save chunks metadata
    with open(
        "vector_store/chunks.pkl",
        "wb"
    ) as f:

        pickle.dump(metadata, f)

    print("✅ Vector Store Created Successfully")