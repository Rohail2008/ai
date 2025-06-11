from flask import Flask, request, jsonify
import datetime
import requests
from flask_cors import CORS # Import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/')
def home():
    return "JARVIS Python Backend is Running"

@app.route('/command', methods=['POST'])
def process_command():
    data = request.get_json()
    msg = data.get('message', '').lower()
    response_text = "I'm not sure how to respond to that."
    action = None # New variable to indicate specific actions for frontend
    query = None # New variable for search queries

    # General Greetings
    if "hello jarvis" in msg or "hi jarvis" in msg or "hey jarvis" in msg:
        response_text = "Hello there! How can I assist you today?"

    # Date & Time (These are also handled on frontend for quick response, but backend can confirm)
    elif "time" in msg:
        response_text = "The time according to my server is " + datetime.datetime.now().strftime("%I:%M %p")
    elif "date" in msg:
        response_text = "Today's date according to my server is " + datetime.datetime.now().strftime("%B %d, %Y")

    # Joke
    elif "tell me a joke" in msg or "joke" in msg:
        try:
            joke_data = requests.get("https://official-joke-api.appspot.com/random_joke").json()
            response_text = f"{joke_data['setup']} ... {joke_data['punchline']}"
        except Exception as e:
            print(f"Error fetching joke: {e}")
            response_text = "Sorry, I couldn't fetch a joke right now."

    # Web Search Trigger
    elif "search for" in msg:
        query = msg.split("search for")[1].strip()
        response_text = f"Searching the web for {query}."
        action = "web_search"
    elif "find information about" in msg:
        query = msg.split("find information about")[1].strip()
        response_text = f"Looking up information about {query}."
        action = "web_search"
    elif "google" in msg and ("what is" in msg or "who is" in msg or "how to" in msg):
        query_parts = []
        if "what is" in msg: query_parts = msg.split("what is", 1)
        elif "who is" in msg: query_parts = msg.split("who is", 1)
        elif "how to" in msg: query_parts = msg.split("how to", 1)

        if len(query_parts) > 1:
            query = query_parts[1].strip()
            response_text = f"I'll search Google for {query}."
            action = "web_search"
        else:
            response_text = "What would you like me to Google?"

    # Translate (Placeholder for future development)
    elif "translate" in msg:
        parts = msg.split("translate")
        if len(parts) > 1:
            query = parts[1].strip()
            response_text = f"The translation feature is under development. You asked to translate: {query}"
        else:
            response_text = "Please specify what to translate for me."

    # Weather (Instruct frontend to handle)
    elif "weather" in msg:
        response_text = "I use your browser's location for weather. Please ensure location access is enabled on the frontend."

    # Advanced AI Query (Placeholder for actual AI model)
    elif any(kw in msg for kw in ["what is", "who is", "how do", "explain", "define", "tell me about"]):
        # This is where you would integrate with an actual AI API like OpenAI's GPT or Google's Gemini.
        # Example (conceptual):
        # try:
        #     ai_response = call_ai_model(msg) # This function would call the external AI API
        #     response_text = ai_response
        # except Exception as e:
        #     print(f"AI model error: {e}")
        #     response_text = "I'm having trouble connecting to my advanced AI model right now."
        response_text = f"That's a great question! For advanced queries like '{msg}', I would typically use a powerful AI model, but direct integration requires an API key and is a more complex setup. I can search Google for that if you'd like, just say 'search for [your query]'."

    # Default action if no specific command matches and no AI fallback has occurred
    else:
        response_text = "I can try to search for that online. Just say 'search for' followed by your query."

    return jsonify({"response": response_text, "action": action, "query": query})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)