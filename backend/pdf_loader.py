# backend/pdf_loader.py
import os
import requests
from io import BytesIO
from pypdf import PdfReader
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_product_resources(product_id):
    """Fetches the list of resources from the database."""
    response = (
        supabase.table("product_resources")
        .select("*")
        .eq("product_id", product_id)
        .execute()
    )
    return response.data

def extract_pdf_text(pdf_url):
    """Downloads a PDF from a URL and extracts its raw text."""
    response = requests.get(pdf_url)
    if response.status_code != 200:
        raise Exception(f"Unable to download PDF. Status code: {response.status_code}")

    pdf_file = BytesIO(response.content)
    reader = PdfReader(pdf_file)
    
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
            
    return text