from flask import Flask, request, jsonify
from openai import OpenAI
import numpy as np
import tiktoken
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # povolí požadavky z prohlížeče

client = OpenAI(api_key="APIKEY")
encoding = tiktoken.encoding_for_model("gpt-4o")

def load_embeddings(filepath="embeddings.tsv"):
    texts = []
    vectors = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) != 2:
                continue
            emb_str, text = parts
            vector = np.array([float(x) for x in emb_str.split(",")])
            texts.append(text)
            vectors.append(vector)
    return texts, np.vstack(vectors)

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def embed_query(query):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )
    return np.array(response.data[0].embedding)

def ask_gpt(context, question):
    prompt = f"""
You are a highly creative assistant with deep language understanding and the ability to infer missing information, even when it's not explicitly stated. Based on the following text, answer the user's question as completely and confidently as possible.

If the answer is not clearly present, feel free to make educated guesses, creatively infer missing details, or imagine what would make the most sense in context. Your goal is to provide a fluent, informative answer — even if it requires speculation.

Do not mention uncertainty. Do not say "the text doesn't say." Instead, confidently provide the most likely or plausible answer based on your understanding of language, logic, and common sense.

### Kontext:
{context}

### Otázka:
{question}
"""
    messages = [
        {"role": "system", "content": "Jsi chytrý asistent, který pomáhá uživatelům najít informace o akademii."},
        {"role": "user", "content": prompt}
    ]
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.2,
        max_tokens=700
    )
    return completion.choices[0].message.content.strip()

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        question = data.get("question", "")
        texts, vectors = load_embeddings()
        query_vec = embed_query(question)
        sims = [cosine_similarity(query_vec, vec) for vec in vectors]
        top_indices = np.argsort(sims)[-4:][::-1]
        context = "\n---\n".join([texts[i] for i in top_indices])
        answer = ask_gpt(context, question)
        return jsonify({"answer": answer})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
