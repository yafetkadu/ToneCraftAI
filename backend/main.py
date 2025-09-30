# Imports 
from fastapi import FastAPI, HTTPException, Depends, status, Request
from pydantic import BaseModel
from typing import Annotated
import models
from db.database import Base, engine
from models.models import UserModel, EmailModel
from db.database import engine, SessionLocal
from sqlalchemy.orm import Session
import hashlib
import secrets

# Schemas
from schemas.user_schema import UserCreate, UserLogin
from schemas.email_schema import EmailRequest, EmailResponse

from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse


# Services
from services.ai_service import generate_email_message


from dotenv import load_dotenv
import os

# JWT imports
import jwt
from jwt.exceptions import PyJWTError
from datetime import datetime, timedelta, timezone

# Load environment variables
load_dotenv('.env')

# Setups
app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 

# Auth setup
SECRET_KEY = os.getenv("SECRET_KEY") or "your-secret-key-here"  # Fallback if not in env
ALGORITHM = os.getenv("ALGORITHM") or "HS256"  # Fallback if not in env
ACCESS_TOKEN_EXPIRE_MINUTES = 60
auth_scheme = HTTPBearer()  # reads the Bearer token from the Authorization header

# Simple password hashing helpers (without external dependencies)
def get_password_hash(password: str) -> str:
    """Create a simple hash using SHA-256 with a salt"""
    salt = secrets.token_hex(16)
    return f"{salt}${hashlib.sha256((password + salt).encode()).hexdigest()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    if not hashed_password or '$' not in hashed_password:
        return False
    
    try:
        salt, stored_hash = hashed_password.split('$')
        computed_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return secrets.compare_digest(computed_hash, stored_hash)
    except ValueError:
        return False

# JWT helpers
def create_access_token(secret_key: str, algorithm: str, data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, secret_key, algorithm=algorithm)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def verify_token(token: str) -> bool:
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return True
    except PyJWTError:
        return False

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        username = payload.get("sub")
        
        if user_id is None or username is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        # Verify user still exists in database
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
    except PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    return {"id": user_id, "username": username}

# Dependencies
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

# API Endpoints
@app.get('/')
def index():
    return {"message": "API READY"}

@app.get('/welcome')
def index():
    return {"message": "Welcome to ToneCraft Write your Emails Professionally"}

# AUTH ROUTES
@app.post('/auth/signup', status_code=status.HTTP_201_CREATED)
async def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hash the password before storing
    #hashed_password = get_password_hash(user.password)
    
    new_user = UserModel(
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        password=user.password  # Store hashed password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Return user data without password
    return {
        "id": new_user.id,
        "firstname": new_user.firstname,
        "lastname": new_user.lastname,
        "email": new_user.email
    }

@app.post("/auth/login", status_code=status.HTTP_202_ACCEPTED)
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if user.password != existing_user.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        data={
            "id": existing_user.id,
            "sub": existing_user.email,
        },
        expires_delta=access_token_expires
    )

    #return RedirectResponse(
    #    url=f"/auth/success?token={access_token}",  # Changed # to ?
    #    status_code=status.HTTP_302_FOUND
    #)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": existing_user.id,
        "email": existing_user.email,
        "firstname": existing_user.firstname,
        "lastname": existing_user.lastname,
        "tone_token": existing_user.craft_tokens
    }

@app.get("/auth/success")
def success(token: str):  # FastAPI will automatically get the token from query params
    return {"message": "Login successful", "token": token}

@app.get("/check_login", status_code=status.HTTP_200_OK)
async def get_profile(user: user_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")
    return {"user": user}

# Placeholder Email Routes
@app.post("/generate")
def generate_professional_email(email: EmailRequest, user: user_dependency, db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")
    
    # Extract the email from the token structure
    user_email = user["username"]

    # Query the user from the DB
    current_user = db.query(UserModel).filter(UserModel.email == user_email).first()


    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.craft_tokens < 1:
        raise HTTPException(status_code=402, detail="Not enough craft tokens")
    
    # Generate the email using the function you wrote
    generated_message = generate_email_message(email.draft, email.tone)

    # Optionally: deduct 1 token
    current_user.craft_tokens -= 1
    db.commit()

    return {"drafted_email": generated_message, 'current_tokens': current_user.craft_tokens}

@app.get("/history")
def get_email_history():
    pass

# Token routes
@app.get("/tokens")
def check_tokens():
    pass

@app.post("/tokens/use")
def use_tokens():
    pass