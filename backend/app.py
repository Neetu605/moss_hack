from fastapi import FastAPI
from pydantic import BaseModel
from retrieve import retrieve_context
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Load Gemini model
model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

# Create FastAPI app
app = FastAPI()


# Request schema
class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
async def chat(request: ChatRequest):

    question = request.question

    # Retrieve top chunks
    retrieved_chunks = retrieve_context(
        question=question,
        k=5,
        semantic_weight=0.7,
        keyword_weight=0.3
    )

    # Build context
    context = "\n\n".join(
        retrieved_chunks
    )

    # Prompt
    prompt = f"""
You are an expert technical support assistant.

Answer ONLY using the information present in the documentation.

If the answer is unavailable, reply:

"I could not find that information in the uploaded manuals."

Documentation:

{context}

Question:

{question}
"""

    # Generate answer
    response = model.generate_content(
        prompt
    )

    answer = response.text

    return {
        "answer": answer
    }