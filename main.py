# Imports 
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session

from dotenv import load_dotenv
import os


# Setups
app = FastAPI()
models.Base.metadata.create_all(bind=engine)

# validating requests


# Dependincy for our database (whenever you want to access the database we call this method)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 


db_dependency = Annotated[Session, Depends(get_db)]

# API end Points

