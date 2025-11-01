from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
import jwt
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from agent import DynamicCareerGuidanceAgent
from roadmap_agent import RoadmapAgent
from model import User, UserCreate, UserResponse, AnswerRequest, HexacoScores, Roadmap, RoadmapRequest, RoadmapStep, StepDetailsRequest
from db import get_db, init_db, DBUser, DBHexacoScores, DBRoadmap
import uuid

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))  # Default: 30 days

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://synapse.neurofox.live"],  # Adjust this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

class CareerGuidanceRouter:
    def __init__(self):
        self.agent = DynamicCareerGuidanceAgent()  # Your existing agent class
        self.roadmap_agent = RoadmapAgent() # Initialize RoadmapAgent
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        credentials_exception = HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_email: str = payload.get("sub")
            if user_email is None:
                raise credentials_exception
            
            # Query user from database
            db_user = db.query(DBUser).filter(DBUser.email == user_email).first()
            if db_user is None:
                raise credentials_exception
                
            # Convert DB user to Pydantic model
            user = User(
                id=db_user.id,
                username=db_user.username,
                email=db_user.email,
                hashed_password=db_user.hashed_password,
                conversation_history=db_user.conversation_history,
                user_profile=db_user.user_profile,
                career_recommendations=db_user.career_recommendations,
                additional_advice=db_user.additional_advice
            )
            
            # Get hexaco scores if they exist
            db_hexaco = db.query(DBHexacoScores).filter(DBHexacoScores.user_id == db_user.id).first()
            if db_hexaco:
                user.hexaco_scores = HexacoScores(
                    honesty_humility=db_hexaco.honesty_humility,
                    emotionality=db_hexaco.emotionality,
                    extraversion=db_hexaco.extraversion,
                    agreeableness=db_hexaco.agreeableness,
                    conscientiousness=db_hexaco.conscientiousness,
                    openness_to_experience=db_hexaco.openness_to_experience
                )
                
            return user
        except jwt.PyJWTError:
            raise credentials_exception

    async def generate_career_roadmap(self, career_start: str, career_goal: str) -> Roadmap:    
        return await self.roadmap_agent.generate_career_roadmap(career_start,career_goal)

    async def get_roadmap_step_details(self, step_details_request: StepDetailsRequest) -> dict:
        return await self.roadmap_agent.get_roadmap_step_details(step_details_request.step, step_details_request.overall_goal)

    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def register_user(self, user: UserCreate, db: Session):
        # Check if user already exists
        existing_user = db.query(DBUser).filter(DBUser.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash(user.password)
        
        # Initialize conversation history with system prompt
        conversation_history = [{"role": "system", "parts": [self.agent.system_prompt]}]
        
        # Create default user profile
        user_profile = {
            "interests": [],
            "skills": [],
            "personality_traits": [],
            "values": [],
            "education_level": "",
            "experience_level": "",
            "dislikes": []
        }
        
        # Create database user
        db_user = DBUser(
            id=user_id,
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            conversation_history=conversation_history,
            user_profile=user_profile,
            career_recommendations=[],
            additional_advice=""
        )
        
        # Add to database and commit
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"message": "User created successfully"}

    async def get_next_question(self, current_user: User = Depends(get_current_user)):
        # Generate next question based on user's conversation history
        question = self.agent.generate_question(current_user.conversation_history, current_user.hexaco_scores)
        current_user.conversation_history.append({
            "role": "user",
            "parts": [question]
        })
        return UserResponse(question=question)

    async def submit_answer(self, answer: str, current_user: User, db: Session):
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
        
        # Update database with new conversation history and profile
        db_user = db.query(DBUser).filter(DBUser.id == current_user.id).first()
        if db_user:
            db_user.conversation_history = current_user.conversation_history
            db_user.user_profile = current_user.user_profile
            db.commit()
        
        # Generate next question or recommendations
        if len(current_user.conversation_history) >= 10:
            recommendations = self.agent.generate_recommendations(
                current_user.user_profile,
                current_user.hexaco_scores
            )
            
            # Save recommendations to database
            if db_user:
                db_user.career_recommendations = [rec.model_dump() for rec in recommendations.recommendations]
                db_user.additional_advice = recommendations.additional_advice
                db.commit()
                
            return recommendations
        
        next_question = self.agent.generate_question(current_user.conversation_history, current_user.hexaco_scores)
        current_user.conversation_history.append({
            "role": "user",
            "parts": [next_question]
        })
        
        # Update database with new question
        if db_user:
            db_user.conversation_history = current_user.conversation_history
            db.commit()
            
        return UserResponse(question=next_question)

# Initialize router
career_router = CareerGuidanceRouter()

# FastAPI routes
@app.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    return await career_router.register_user(user, db)

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user by email (username field contains email)
    db_user = db.query(DBUser).filter(DBUser.email == form_data.username).first()
    
    if not db_user or not pwd_context.verify(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = career_router.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/question")
async def get_question(current_user: User = Depends(career_router.get_current_user)):
    response = await career_router.get_next_question(current_user)
    return response

@app.post("/answer")
async def submit_answer(
    answer: AnswerRequest,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    response = await career_router.submit_answer(answer.answer, current_user, db)
    return response

@app.get("/profile")
async def get_profile(current_user: User = Depends(career_router.get_current_user)):
    return current_user.user_profile

@app.post("/hexaco_scores")
async def set_hexaco_scores(hexaco_scores: HexacoScores, current_user: User = Depends(career_router.get_current_user), db: Session = Depends(get_db)):
    # Update the user model
    current_user.hexaco_scores = hexaco_scores
    
    # Check if hexaco scores already exist for this user
    db_hexaco = db.query(DBHexacoScores).filter(DBHexacoScores.user_id == current_user.id).first()
    
    if db_hexaco:
        # Update existing scores
        db_hexaco.honesty_humility = hexaco_scores.honesty_humility
        db_hexaco.emotionality = hexaco_scores.emotionality
        db_hexaco.extraversion = hexaco_scores.extraversion
        db_hexaco.agreeableness = hexaco_scores.agreeableness
        db_hexaco.conscientiousness = hexaco_scores.conscientiousness
        db_hexaco.openness_to_experience = hexaco_scores.openness_to_experience
    else:
        # Create new scores
        db_hexaco = DBHexacoScores(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            honesty_humility=hexaco_scores.honesty_humility,
            emotionality=hexaco_scores.emotionality,
            extraversion=hexaco_scores.extraversion,
            agreeableness=hexaco_scores.agreeableness,
            conscientiousness=hexaco_scores.conscientiousness,
            openness_to_experience=hexaco_scores.openness_to_experience
        )
        db.add(db_hexaco)
    
    # Commit changes
    db.commit()
    
    return {"message": "HEXACO scores set successfully"}

@app.get("/hexaco_scores")
async def get_hexaco_scores(current_user: User = Depends(career_router.get_current_user)):
    if current_user.hexaco_scores:
        return current_user.hexaco_scores
    raise HTTPException(status_code=404, detail="HEXACO scores not found for this user")


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(career_router.get_current_user)):
    return current_user


@app.post("/roadmap", response_model=Roadmap)
async def generate_roadmap(request: RoadmapRequest, current_user: User = Depends(career_router.get_current_user), db: Session = Depends(get_db)):
    # Generate roadmap
    roadmap = await career_router.generate_career_roadmap(current_user.user_profile["education_level"], request.career_goal)
    
    # Save roadmap to database
    db_roadmap = DBRoadmap(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        career_goal=request.career_goal,
        career_start=current_user.user_profile["education_level"],
        nodes=[node.model_dump() for node in roadmap.nodes],
        edges=[edge.model_dump() for edge in roadmap.edges]
    )
    
    db.add(db_roadmap)
    db.commit()
    
    return roadmap

@app.get("/roadmap/step/{step_id}")
async def get_roadmap_step_details(step_details_request: StepDetailsRequest, current_user: User = Depends(career_router.get_current_user)):
    return await career_router.get_roadmap_step_details(step_details_request)

@app.post("/roadmap/step-details")
async def get_roadmap_step_details(step_details_request: StepDetailsRequest, current_user: User = Depends(career_router.get_current_user)):
    return await career_router.get_roadmap_step_details(step_details_request)