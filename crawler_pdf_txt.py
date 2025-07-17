import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from openai import OpenAI
import os
import tiktoken
import time
import PyPDF2  # PDF

# 🔑 Nastav si svůj OpenAI API klíč sem
client = OpenAI(api_key="APIKEY")

BASE_URL = "https://www.akademie-vzdelavani.cz/"
visited = set()
pages_text = []

encoding = tiktoken.encoding_for_model("gpt-4o")

def count_tokens(text):
    return len(encoding.encode(text))

def split_text(text, max_tokens=700):
    sentences = text.split(". ")
    chunks = []
    current = ""
    for sentence in sentences:
        if count_tokens(current + sentence) > max_tokens:
            chunks.append(current.strip())
            current = sentence + ". "
        else:
            current += sentence + ". "
    if current:
        chunks.append(current.strip())
    return chunks

def scrape_page(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        return text
    except Exception as e:
        print(f"❌ Chyba při zpracování {url}: {e}")
        return ""

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text_from_txt(txt_path):
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()

MAX_DEPTH = 5

def crawl(url, depth=1):
    if url in visited or depth > MAX_DEPTH:
        return
    visited.add(url)
    print(f"🔎 Procházím: {url}")
    text = scrape_page(url)
    if text:
        print(f"📄 Přidávám text z: {url}")
        pages_text.append(text)
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        for link_tag in soup.find_all("a", href=True):
            href = link_tag["href"]
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == urlparse(BASE_URL).netloc:
                crawl(full_url, depth + 1)
    except:
        pass

def embed_text(text_chunk):
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text_chunk
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Chyba při embedování: {e}")
        return []

if __name__ == "__main__":
    import sys
    print("\nVyber režim:")
    print("1) Web crawling (jako doteď)")
    print("2) Přidat znalosti z PDF souboru")
    print("3) Přidat znalosti z TXT souboru")
    mode = input("Zadej číslo režimu (1, 2 nebo 3): ").strip()

    all_chunks = []

    if mode == "2":
        pdf_path = input("Zadej cestu k PDF souboru: ").strip()
        if not os.path.exists(pdf_path):
            print("❌ Soubor nenalezen.")
            exit(1)
        print(f"📥 Načítám PDF: {pdf_path}")
        text = extract_text_from_pdf(pdf_path)
        chunks = split_text(text)
        all_chunks.extend(chunks)
    elif mode == "3":
        txt_path = input("Zadej cestu k TXT souboru: ").strip()
        if not os.path.exists(txt_path):
            print("❌ Soubor nenalezen.")
            exit(1)
        print(f"📥 Načítám TXT: {txt_path}")
        text = extract_text_from_txt(txt_path)
        chunks = split_text(text)
        all_chunks.extend(chunks)
    else:
        print("🚀 Start crawling...")
        crawl(BASE_URL)
        for page in pages_text:
            chunks = split_text(page)
            all_chunks.extend(chunks)

    print(f"🧩 Celkem chunků: {len(all_chunks)}")

    with open("embeddings.tsv", "a", encoding="utf-8") as f:
        for chunk in all_chunks:
            embedding = embed_text(chunk)
            if embedding:
                emb_str = ",".join(map(str, embedding))
                f.write(f"{emb_str}\t{chunk}\n")
                time.sleep(0.5)

    print("✅ Hotovo! Embeddingy uloženy do embeddings.tsv")
