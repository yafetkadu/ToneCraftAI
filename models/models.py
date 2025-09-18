# models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from db.database import Base, engine
from datetime import datetime

# User table
class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String(50), nullable=False)
    lastname = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    craft_tokens = Column(Integer, default=10)

# Email table
class EmailModel(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_text = Column(Text, nullable=False)
    rewritten_text = Column(Text)
    tone = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
