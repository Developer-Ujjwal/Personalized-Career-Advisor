from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Dict
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from agent import DynamicCareerGuidanceAgent
from model import User, UserCreate, UserResponse, AnswerRequest

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT settings
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30*100000000

app = FastAPI()

#TODO In-memory user storage (replace with database in production)
users_db: Dict[str, User] = {}

class CareerGuidanceRouter:
    def __init__(self):
        self.agent = DynamicCareerGuidanceAgent()  # Your existing agent class
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme)):
        credentials_exception = HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None or username not in users_db:
                raise credentials_exception
            return users_db[username]
        except jwt.PyJWTError:
            raise credentials_exception

    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def register_user(self, user: UserCreate):
        if user.username in users_db:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
        )
        db_user.conversation_history.append({"role": "system", "parts": [self.agent.system_prompt]})
        users_db[user.username] = db_user
        return {"message": "User created successfully"}

    async def get_next_question(self, current_user: User = Depends(get_current_user)):
        # Generate next question based on user's conversation history
        question = self.agent.generate_question(current_user.conversation_history, current_user.personality_type)
        current_user.conversation_history.append({
            "role": "user",
            "parts": [question]
        })
        return UserResponse(question=question)

    async def submit_answer(self, answer: str, current_user: User = Depends(get_current_user)):
        # Update user's conversation history and profile
        current_user.conversation_history.append({
            "role": "user",
            "parts": [answer]
        })
        
        # Extract profile information
        response = self.agent.extract_profile_info(
            current_user.conversation_history[-1]["parts"][0],  # Last question
            answer
        )
        
        if response is not None:
            for key, value in response.items():
                if key in current_user.user_profile:
                    if isinstance(value, list):
                        current_user.user_profile[key].extend(value)
                    elif isinstance(value, str) and value:
                        if key in ["education_level", "experience_level"]:
                            current_user.user_profile[key] = value
                        else:
                            current_user.user_profile[key].append(value)
        
        # Generate next question or recommendations
        if len(current_user.conversation_history) >= 10:
            recommendations = self.agent.generate_recommendations(
                current_user.user_profile,
                current_user.personality_type
            )
            return recommendations
        
        next_question = self.agent.generate_question(current_user.conversation_history, current_user.personality_type)
        current_user.conversation_history.append({
            "role": "user",
            "parts": [next_question]
        })
        return UserResponse(question=next_question)

# Initialize router
career_router = CareerGuidanceRouter()

# FastAPI routes
@app.post("/register")
async def register(user: UserCreate):
    return await career_router.register_user(user)

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = career_router.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/question")
async def get_question(current_user: User = Depends(career_router.get_current_user)):
    response = await career_router.get_next_question(current_user)
    return response

@app.post("/answer")
async def submit_answer(
    answer: AnswerRequest,
    current_user: User = Depends(career_router.get_current_user)
):
    response = await career_router.submit_answer(answer.answer, current_user)
    return response

@app.get("/profile")
async def get_profile(current_user: User = Depends(career_router.get_current_user)):
    return current_user.user_profile

@app.post("/personality_type")
async def set_personality_type(personality_type: str = Body(...), current_user: User = Depends(career_router.get_current_user)):
    current_user.personality_type = personality_type
    return {"message": "Personality type set successfully"}