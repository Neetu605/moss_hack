# backend/chunking.py
from langchain_text_splitters import RecursiveCharacterTextSplitter

def create_chunks(text):
    """Splits raw text into manageable chunks for vector embeddings."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(text)
    return chunks