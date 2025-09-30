from pydantic import BaseModel

class EmailRequest(BaseModel):
    draft: str
    tone: str

class EmailResponse(BaseModel):
    generated_email: str