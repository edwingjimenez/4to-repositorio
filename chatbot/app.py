from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configuración de OpenRouter
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        api_key = data.get('api_key', OPENROUTER_API_KEY)
        
        if not api_key:
            return jsonify({"error": "API Key no proporcionada. Por favor, configúrala en la interfaz."}), 400
        
        if not user_message:
            return jsonify({"error": "El mensaje no puede estar vacío"}), 400
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Chatbot Flask"
        }
        
        payload = {
            "model": "openai/gpt-oss-120b",
            "messages": [
                {
                    "role": "system", 
                    "content": "Eres un asistente útil y amable. Responde de forma natural y conversacional, sin usar puntos numerados, viñetas o formatos excesivamente estructurados. Tu tono debe ser coloquial y amigable, como en una conversación normal. Si necesitas enumerar cosas, hazlo de forma fluida dentro de párrafos naturales."
                },
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.8,
            "max_tokens": 1000
        }
        
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        response_data = response.json()
        
        if response.status_code == 200:
            bot_reply = response_data['choices'][0]['message']['content']
            return jsonify({"reply": bot_reply})
        else:
            error_msg = response_data.get('error', {}).get('message', 'Error desconocido')
            return jsonify({"error": f"Error en la API: {error_msg}"}), 500
            
    except requests.exceptions.Timeout:
        return jsonify({"error": "Tiempo de espera agotado. Por favor, intenta nuevamente."}), 408
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)