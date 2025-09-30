from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('../.env')

# Get API key from .env
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# Create client
client = OpenAI(api_key=OPENAI_KEY)

# System prompt to define the assistant's behavior
SYSTEM_MESSAGE = """
You are an AI Email Assistant that helps users quickly generate polished, professional, or personalized email and text message drafts from short prompts and tone selections. Users will provide a brief description of the message they want to send (e.g., 'meeting reschedule' or 'follow-up on proposal') and choose a tone such as formal, casual, friendly, professional, or enthusiastic.

Your goal is to return a full, ready-to-send message in that tone—well-structured, grammatically correct, and appropriate to the task. Messages should reflect human nuance and avoid being too generic, unless explicitly asked. If the user does not specify a tone, you should default to professional. You should also gently guide users toward clearer prompts if their input is too vague.

Avoid reiterating the prompt directly in the output; instead, interpret and rephrase it to make the message feel organic. For example, if the prompt is 'project deadline extension,' a professional email might say 'I'm reaching out to request an extension on the current deadline for our project' rather than copying the exact phrase.

Do not ask for recipient names or personal info unless the user wants to customize further. Prioritize clarity, brevity, and a natural human tone in all outputs.
"""

def generate_email_message(prompt: str, tone: str = "professional") -> str:
    """
    Generates an email or message based on a short prompt and tone.
    """
    chat_messages = [
        {"role": "system", "content": SYSTEM_MESSAGE},
        {"role": "user", "content": f"{prompt}, tone: {tone}"}
    ]

    # ✅ new style call
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # or gpt-4o if you have access
        messages=chat_messages,
        temperature=0.7
    )

    return response.choices[0].message.content.strip()


