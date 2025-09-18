from pydantic import BaseModel

class EmailRequest(BaseModel):
    text: str
    tone: str

class EmailResponse(BaseModel):
    generated_email: str