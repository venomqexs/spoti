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
import logging
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, validator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Foxenfy API", 
    version="2.0.0",
    description="Premium Music Streaming Platform API"
)

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
db = client.foxenfy_db

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
        logger.info(f"User {user_id} connected to chat")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        logger.info(f"User {user_id} disconnected from chat")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")

    async def broadcast(self, message: str):
        disconnected = []
        for user_id, connection in self.user_connections.items():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to user {user_id}: {e}")
                disconnected.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected:
            if user_id in self.user_connections:
                del self.user_connections[user_id]

manager = ConnectionManager()

# Enhanced Pydantic models with validation
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 20:
            raise ValueError('Username must be less than 20 characters long')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long')
        return v

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

    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 1:
            raise ValueError('Playlist name cannot be empty')
        if len(v) > 100:
            raise ValueError('Playlist name is too long')
        return v.strip()

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ChatMessage(BaseModel):
    message: str

    @validator('message')
    def validate_message(cls, v):
        if len(v.strip()) < 1:
            raise ValueError('Message cannot be empty')
        if len(v) > 500:
            raise ValueError('Message is too long')
        return v.strip()

class User(BaseModel):
    id: str
    username: str
    email: str
    role: str
    avatar: Optional[str] = None
    created_at: datetime
    premium_until: Optional[datetime] = None

# Utility functions with enhanced error handling
def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password processing failed"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token generation failed"
        )

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
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise credentials_exception
    
    try:
        user = await db.users.find_one({"_id": user_id})
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        logger.error(f"Database user lookup error: {e}")
        raise credentials_exception

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# API Routes with enhanced error handling
@app.get("/")
async def root():
    return {"message": "Foxenfy API is running!", "version": "2.0.0", "status": "active"}

@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    try:
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
            "listening_history": [],
            "playlists": []
        }
        
        await db.users.insert_one(user_doc)
        logger.info(f"New user registered: {user.username} ({user.email})")
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to server error"
        )

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    try:
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
        
        logger.info(f"User logged in: {db_user['username']} ({db_user['email']})")
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to server error"
        )

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    try:
        return {
            "id": current_user["_id"],
            "username": current_user["username"],
            "email": current_user["email"],
            "role": current_user["role"],
            "avatar": current_user.get("avatar"),
            "created_at": current_user["created_at"],
            "premium_until": current_user.get("premium_until")
        }
    except Exception as e:
        logger.error(f"Get user info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )

@app.get("/api/search")
async def search_songs(q: str, max_results: int = 20, current_user: dict = Depends(get_current_user)):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    if max_results > 50:
        max_results = 50
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": f"{q} music",
                    "type": "video",
                    "maxResults": max_results,
                    "key": YOUTUBE_API_KEY,
                    "videoCategoryId": "10"  # Music category
                }
            )
            
            if response.status_code != 200:
                logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail="Music search service temporarily unavailable")
                
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
            
            logger.info(f"Search performed by {current_user['username']}: '{q}' - {len(songs)} results")
            return {"songs": songs, "query": q, "total": len(songs)}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed due to server error")

# WebSocket endpoint for chat with enhanced error handling
@app.websocket("/api/chat/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                
                # Validate message
                if not message_data.get("message", "").strip():
                    continue
                
                # Save message to database
                message_doc = {
                    "_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "message": message_data["message"].strip(),
                    "timestamp": datetime.utcnow(),
                    "deleted": False
                }
                await db.chat_messages.insert_one(message_doc)
                
                # Get user info for broadcast
                user = await db.users.find_one({"_id": user_id})
                if user:
                    broadcast_message = {
                        "id": message_doc["_id"],
                        "user_id": user_id,
                        "username": user["username"],
                        "avatar": user.get("avatar"),
                        "message": message_data["message"].strip(),
                        "timestamp": message_doc["timestamp"].isoformat()
                    }
                    
                    await manager.broadcast(json.dumps(broadcast_message))
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from user {user_id}")
                continue
            except Exception as e:
                logger.error(f"Chat message processing error: {e}")
                continue
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

@app.get("/api/chat/messages")
async def get_chat_messages(limit: int = 50, current_user: dict = Depends(get_current_user)):
    try:
        if limit > 100:
            limit = 100
            
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
        
        return {"messages": enriched_messages, "total": len(enriched_messages)}
        
    except Exception as e:
        logger.error(f"Get chat messages error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat messages"
        )

# Health check endpoint
@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        result = await client.admin.command('ping')
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
            "api": "operational"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected",
            "api": "operational",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")