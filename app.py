from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import sqlite3

app = Flask(__name__)
CORS(app)

conn = sqlite3.connect("new_chat.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_message TEXT,
    bot_reply TEXT
)
""")

conn.commit()

client = Groq(
    api_key="YOUR API KEY HERE"
)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data["message"]
        personality = data.get("personality", "")
        system_prompt = ""

        if personality == "teacher":
            system_prompt = "Explain concepts clearly like a teacher."
        elif personality == "programmer":
            system_prompt = "Answer like an expert programmer."
        elif personality == "motivator":
            system_prompt = "Answer like a motivational coach."
        elif personality == "poet":
            system_prompt = "Answer like a creative poet."
        else:
            system_prompt = "Be a helpful AI assistant."

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )

        reply = response.choices[0].message.content

        cursor.execute(
            "INSERT INTO chats (user_message, bot_reply) VALUES (?, ?)",
            (user_message, reply)
        )
        conn.commit()

        return jsonify({"reply": reply})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "reply": "⚠️ Groq AI is busy right now. Please try again later."
        }), 500
    except Exception as e:
        print("UPLOAD ERROR:", e)
        return jsonify({
            "message": "⚠️ File upload failed."
        }), 500

if __name__ == "__main__":
    app.run(debug=False)
