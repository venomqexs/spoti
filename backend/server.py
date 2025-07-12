from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os
import httpx
import uuid
import json
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Spotify Clone API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client.spotify_clone

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30))
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# WebSocket connection manager for chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_connections[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_connections:
            del self.user_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_connections:
            await self.user_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                continue

manager = ConnectionManager()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ChatMessage(BaseModel):
    message: str

class User(BaseModel):
    id: str
    username: str
    email: str
    role: str
    avatar: Optional[str] = None
    created_at: datetime
    premium_until: Optional[datetime] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# API Routes
@app.get("/")
async def root():
    return {"message": "Spotify Clone API is running!"}

@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    existing_username = await db.users.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "_id": user_id,
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": "user",
        "avatar": None,
        "created_at": datetime.utcnow(),
        "premium_until": None,
        "liked_songs": [],
        "listening_history": []
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    user_response = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "role": "user",
        "avatar": None,
        "created_at": user_doc["created_at"],
        "premium_until": None
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["_id"]}, expires_delta=access_token_expires
    )
    
    user_response = {
        "id": db_user["_id"],
        "username": db_user["username"],
        "email": db_user["email"],
        "role": db_user["role"],
        "avatar": db_user.get("avatar"),
        "created_at": db_user["created_at"],
        "premium_until": db_user.get("premium_until")
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "avatar": current_user.get("avatar"),
        "created_at": current_user["created_at"],
        "premium_until": current_user.get("premium_until")
    }

@app.get("/api/search")
async def search_songs(q: str, max_results: int = 20, current_user: dict = Depends(get_current_user)):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": f"{q} music",
                    "type": "video",
                    "maxResults": max_results,
                    "key": YOUTUBE_API_KEY
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="YouTube API error")
                
            data = response.json()
            
            songs = []
            for item in data.get("items", []):
                song = {
                    "id": item["id"]["videoId"],
                    "title": item["snippet"]["title"],
                    "artist": item["snippet"]["channelTitle"],
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                    "duration": "Unknown",  # Would need additional API call for duration
                    "published_at": item["snippet"]["publishedAt"]
                }
                songs.append(song)
            
            return {"songs": songs}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# WebSocket endpoint for chat
@app.websocket("/api/chat/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to database
            message_doc = {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "message": message_data["message"],
                "timestamp": datetime.utcnow(),
                "deleted": False
            }
            await db.chat_messages.insert_one(message_doc)
            
            # Get user info for broadcast
            user = await db.users.find_one({"_id": user_id})
            broadcast_message = {
                "id": message_doc["_id"],
                "user_id": user_id,
                "username": user["username"],
                "avatar": user.get("avatar"),
                "message": message_data["message"],
                "timestamp": message_doc["timestamp"].isoformat()
            }
            
            await manager.broadcast(json.dumps(broadcast_message))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/api/chat/messages")
async def get_chat_messages(limit: int = 50, current_user: dict = Depends(get_current_user)):
    messages = await db.chat_messages.find(
        {"deleted": False},
        sort=[("timestamp", -1)],
        limit=limit
    ).to_list(length=limit)
    
    # Get user info for each message
    enriched_messages = []
    for msg in reversed(messages):  # Reverse to get chronological order
        user = await db.users.find_one({"_id": msg["user_id"]})
        enriched_messages.append({
            "id": msg["_id"],
            "user_id": msg["user_id"],
            "username": user["username"] if user else "Unknown User",
            "avatar": user.get("avatar") if user else None,
            "message": msg["message"],
            "timestamp": msg["timestamp"].isoformat()
        })
    
    return {"messages": enriched_messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)