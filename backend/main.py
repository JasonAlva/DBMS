from fastapi import FastAPI ,Depends ,HTTPException ,status
from fastapi.security import HTTPBearer ,HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime ,timedelta
from jose import JWTError ,jwt
from passlib.context import CryptContext
from prisma import Prisma
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import os


app = FastAPI(title="College Query System")
db=Prisma()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# JWT Config
SECRET_KEY = os.getenv("SECRET_KEY", "11243543")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],    
)

