from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
import jwt
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from agent import DynamicCareerGuidanceAgent
from roadmap_agent import RoadmapAgent
from model import User, UserCreate, UserResponse, AnswerRequest, HexacoScores, HollandScores, Roadmap, RoadmapRequest, RoadmapStep, StepDetailsRequest, Conversation, ConversationCreate, ConversationResponse, GenerateRecommendationsRequest, Message
from db import get_db, init_db, DBUser, DBHexacoScores, DBHollandScores, DBRoadmap, DBConversation
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
            
            # Get holland scores if they exist
            db_holland = db.query(DBHollandScores).filter(DBHollandScores.user_id == db_user.id).first()
            if db_holland:
                user.holland_scores = HollandScores(
                    realistic=db_holland.realistic,
                    investigative=db_holland.investigative,
                    artistic=db_holland.artistic,
                    social=db_holland.social,
                    enterprising=db_holland.enterprising,
                    conventional=db_holland.conventional
                )
                
            return user
        except jwt.PyJWTError:
            raise credentials_exception

    async def generate_career_roadmap(self, conversation_history: list | None, user_profile: dict | None, career_goal: str) -> Roadmap:
        """Generate a career roadmap using conversation context and user profile when available.

        conversation_history: raw conversation_history list from DB (may be None)
        user_profile: dict containing extracted profile fields (may be None)
        career_goal: target goal string provided by the user
        """
        return await self.roadmap_agent.generate_career_roadmap(conversation_history, user_profile, career_goal)

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

    async def get_next_question(self, conversation_id: str, current_user: User, db: Session):
        # Get conversation from database
        db_conversation = db.query(DBConversation).filter(
            DBConversation.id == conversation_id,
            DBConversation.user_id == current_user.id
        ).first()
        
        if not db_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Initialize conversation history if empty
        if not db_conversation.conversation_history:
            db_conversation.conversation_history = [{"role": "system", "parts": [self.agent.system_prompt]}]
            flag_modified(db_conversation, "conversation_history")
        
        # Generate next question
        question = self.agent.generate_question(
            db_conversation.conversation_history,
            current_user.hexaco_scores,
            current_user.holland_scores
        )
        
        # Initialize messages array if needed
        if not db_conversation.messages:
            db_conversation.messages = []
            flag_modified(db_conversation, "messages")
        
        # Add agent message to messages array
        agent_message = {
            "id": str(uuid.uuid4()),
            "type": "agent",
            "content": question,
            "timestamp": datetime.utcnow().isoformat()
        }
        db_conversation.messages.append(agent_message)
        flag_modified(db_conversation, "messages")
        
        db_conversation.conversation_history.append({
            "role": "assistant",
            "parts": [question]
        })
        flag_modified(db_conversation, "conversation_history")
        
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
        
        return UserResponse(question=question)

    async def submit_answer(self, answer: str, conversation_id: str, current_user: User, db: Session):
        # Get conversation from database
        db_conversation = db.query(DBConversation).filter(
            DBConversation.id == conversation_id,
            DBConversation.user_id == current_user.id
        ).first()
        
        if not db_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Update conversation history
        if not db_conversation.conversation_history:
            db_conversation.conversation_history = [{"role": "system", "parts": [self.agent.system_prompt]}]
            flag_modified(db_conversation, "conversation_history")
        
        # Initialize messages array if needed
        if not db_conversation.messages:
            db_conversation.messages = []
            flag_modified(db_conversation, "messages")
        
        # Add user message to messages array
        user_message = {
            "id": str(uuid.uuid4()),
            "type": "user",
            "content": answer,
            "timestamp": datetime.utcnow().isoformat()
        }
        db_conversation.messages.append(user_message)
        flag_modified(db_conversation, "messages")
        
        db_conversation.conversation_history.append({
            "role": "user",
            "parts": [answer]
        })
        flag_modified(db_conversation, "conversation_history")
        
        # Extract profile information
        last_question = ""
        if len(db_conversation.conversation_history) >= 2:
            last_item = db_conversation.conversation_history[-2]
            if last_item.get("role") == "assistant" or last_item.get("role") == "user":
                last_question = last_item.get("parts", [""])[0] if last_item.get("parts") else ""
        
        response = self.agent.extract_profile_info(last_question, answer)
        
        if response is not None:
            if not db_conversation.user_profile:
                db_conversation.user_profile = {
                    "interests": [],
                    "skills": [],
                    "personality_traits": [],
                    "values": [],
                    "education":"",
                    "experience_level": "",
                    "dislikes": []
                }
                flag_modified(db_conversation, "user_profile")
            
            profile_updated = False
            for key, value in response.items():
                if key in db_conversation.user_profile:
                    if isinstance(value, list):
                        if value:  # Only update if list is not empty
                            db_conversation.user_profile[key].extend(value)
                            profile_updated = True
                    elif isinstance(value, str) and value:
                        if key in ["education", "experience_level"]:
                            db_conversation.user_profile[key] = value
                            profile_updated = True
                        else:
                            if isinstance(db_conversation.user_profile[key], list):
                                db_conversation.user_profile[key].append(value)
                                profile_updated = True
            
            if profile_updated:
                flag_modified(db_conversation, "user_profile")
        
        # Update conversation timestamp
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
        
        # Generate next question (no automatic recommendations)
        next_question = self.agent.generate_question(
            db_conversation.conversation_history,
            current_user.hexaco_scores,
            current_user.holland_scores
        )
        
        # Add agent message to messages array
        agent_message = {
            "id": str(uuid.uuid4()),
            "type": "agent",
            "content": next_question,
            "timestamp": datetime.utcnow().isoformat()
        }
        db_conversation.messages.append(agent_message)
        flag_modified(db_conversation, "messages")
        
        db_conversation.conversation_history.append({
            "role": "assistant",
            "parts": [next_question]
        })
        flag_modified(db_conversation, "conversation_history")
        
        # Update database
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
            
        return UserResponse(question=next_question)
    
    async def create_conversation(self, title: str, current_user: User, db: Session):
        """Create a new conversation for the user"""
        conversation_id = str(uuid.uuid4())
        
        db_conversation = DBConversation(
            id=conversation_id,
            user_id=current_user.id,
            title=title or "New Chat",
            messages=[],
            conversation_history=[{"role": "system", "parts": [self.agent.system_prompt]}],
            user_profile={
                "interests": [],
                "skills": [],
                "personality_traits": [],
                "values": [],
                "education": "",
                "experience_level": "",
                "dislikes": []
            },
            career_recommendations=[],
            additional_advice="",
            influence_breakdown={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        
        return ConversationResponse(
            id=db_conversation.id,
            title=db_conversation.title,
            created_at=db_conversation.created_at.isoformat() if db_conversation.created_at else None,
            updated_at=db_conversation.updated_at.isoformat() if db_conversation.updated_at else None
        )
    
    async def list_conversations(self, current_user: User, db: Session):
        """List all conversations for the user"""
        db_conversations = db.query(DBConversation).filter(
            DBConversation.user_id == current_user.id
        ).order_by(DBConversation.updated_at.desc()).all()
        
        return [
            ConversationResponse(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at.isoformat() if conv.created_at else None,
                updated_at=conv.updated_at.isoformat() if conv.updated_at else None
            )
            for conv in db_conversations
        ]
    
    async def get_conversation(self, conversation_id: str, current_user: User, db: Session):
        """Get a specific conversation with all its data"""
        db_conversation = db.query(DBConversation).filter(
            DBConversation.id == conversation_id,
            DBConversation.user_id == current_user.id
        ).first()
        
        if not db_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Convert messages from conversation_history to Message format
        messages = []
        for i, item in enumerate(db_conversation.conversation_history or []):
            if item.get("role") == "assistant" or item.get("role") == "user":
                role = item.get("role")
                if role == "assistant":
                    role = "agent"
                content = item.get("parts", [""])[0] if item.get("parts") else ""
                if content and role != "system":
                    messages.append({
                        "id": str(i),
                        "type": role,
                        "content": content,
                        "timestamp": datetime.utcnow().isoformat()
                    })
        
        return Conversation(
            id=db_conversation.id,
            user_id=db_conversation.user_id,
            title=db_conversation.title,
            messages=[Message(**msg) for msg in messages],
            conversation_history=db_conversation.conversation_history or [],
            user_profile=db_conversation.user_profile or {},
            career_recommendations=db_conversation.career_recommendations or [],
            additional_advice=db_conversation.additional_advice or "",
            influence_breakdown=db_conversation.influence_breakdown or {},
            created_at=db_conversation.created_at.isoformat() if db_conversation.created_at else None,
            updated_at=db_conversation.updated_at.isoformat() if db_conversation.updated_at else None
        )
    
    async def generate_recommendations_for_conversation(self, conversation_id: str, current_user: User, db: Session):
        """Manually generate recommendations for a conversation"""
        db_conversation = db.query(DBConversation).filter(
            DBConversation.id == conversation_id,
            DBConversation.user_id == current_user.id
        ).first()
        
        if not db_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get hexaco and holland scores from user
        db_hexaco = db.query(DBHexacoScores).filter(DBHexacoScores.user_id == current_user.id).first()
        db_holland = db.query(DBHollandScores).filter(DBHollandScores.user_id == current_user.id).first()
        
        hexaco_scores = None
        if db_hexaco:
            hexaco_scores = HexacoScores(
                honesty_humility=db_hexaco.honesty_humility,
                emotionality=db_hexaco.emotionality,
                extraversion=db_hexaco.extraversion,
                agreeableness=db_hexaco.agreeableness,
                conscientiousness=db_hexaco.conscientiousness,
                openness_to_experience=db_hexaco.openness_to_experience
            )
        
        holland_scores = None
        if db_holland:
            holland_scores = HollandScores(
                realistic=db_holland.realistic,
                investigative=db_holland.investigative,
                artistic=db_holland.artistic,
                social=db_holland.social,
                enterprising=db_holland.enterprising,
                conventional=db_holland.conventional
            )
        
        # Generate recommendations
        recommendations = self.agent.generate_recommendations(
            db_conversation.user_profile or {},
            hexaco_scores,
            holland_scores
        )
        
        # Save recommendations to conversation
        db_conversation.career_recommendations = [rec.model_dump() for rec in recommendations.recommendations]
        flag_modified(db_conversation, "career_recommendations")
        
        db_conversation.additional_advice = recommendations.additional_advice
        db_conversation.influence_breakdown = recommendations.influence_breakdown
        flag_modified(db_conversation, "influence_breakdown")
        
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
        
        return recommendations

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
async def get_question(
    conversation_id: str,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    response = await career_router.get_next_question(conversation_id, current_user, db)
    return response

@app.post("/answer")
async def submit_answer(
    answer: AnswerRequest,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    response = await career_router.submit_answer(answer.answer, answer.conversation_id, current_user, db)
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

@app.post("/holland_scores")
async def set_holland_scores(holland_scores: HollandScores, current_user: User = Depends(career_router.get_current_user), db: Session = Depends(get_db)):
    # Update the user model
    current_user.holland_scores = holland_scores
    
    # Check if holland scores already exist for this user
    db_holland = db.query(DBHollandScores).filter(DBHollandScores.user_id == current_user.id).first()
    
    if db_holland:
        # Update existing scores
        db_holland.realistic = holland_scores.realistic
        db_holland.investigative = holland_scores.investigative
        db_holland.artistic = holland_scores.artistic
        db_holland.social = holland_scores.social
        db_holland.enterprising = holland_scores.enterprising
        db_holland.conventional = holland_scores.conventional
    else:
        # Create new scores
        db_holland = DBHollandScores(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            realistic=holland_scores.realistic,
            investigative=holland_scores.investigative,
            artistic=holland_scores.artistic,
            social=holland_scores.social,
            enterprising=holland_scores.enterprising,
            conventional=holland_scores.conventional
        )
        db.add(db_holland)
    
    # Commit changes
    db.commit()
    
    return {"message": "Holland RIASEC scores set successfully"}

@app.get("/holland_scores")
async def get_holland_scores(current_user: User = Depends(career_router.get_current_user)):
    if current_user.holland_scores:
        return current_user.holland_scores
    raise HTTPException(status_code=404, detail="Holland RIASEC scores not found for this user")

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(career_router.get_current_user)):
    return current_user


@app.post("/roadmap", response_model=Roadmap)
async def generate_roadmap(request: RoadmapRequest, current_user: User = Depends(career_router.get_current_user), db: Session = Depends(get_db)):
    """Generate a roadmap using conversation context when available.

    If `request.conversation_id` is provided and belongs to the current user, use that
    conversation's `conversation_history` and `user_profile`. Otherwise fall back to
    the authenticated user's `user_profile`.
    """
    conversation_history = None
    user_profile = current_user.user_profile or {}

    if getattr(request, "conversation_id", None):
        db_conversation = db.query(DBConversation).filter(
            DBConversation.id == request.conversation_id,
            DBConversation.user_id == current_user.id
        ).first()
        if db_conversation:
            conversation_history = db_conversation.conversation_history or []
            # prefer conversation-scoped user_profile if present
            user_profile = db_conversation.user_profile or user_profile

    # Generate roadmap using conversation history + user profile context
    roadmap = await career_router.generate_career_roadmap(conversation_history, user_profile, request.career_goal)

    # Persist roadmap; derive career_start from the profile if available
    career_start = ""
    try:
        if isinstance(user_profile, dict):
            career_start = user_profile.get("education_level", "") or user_profile.get("education", "")
    except Exception:
        career_start = ""

    db_roadmap = DBRoadmap(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        career_goal=request.career_goal,
        career_start=career_start,
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

# Conversation endpoints
@app.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    return await career_router.create_conversation(conversation.title or "New Chat", current_user, db)

@app.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    return await career_router.list_conversations(current_user, db)

@app.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    return await career_router.get_conversation(conversation_id, current_user, db)

@app.post("/conversations/{conversation_id}/generate-recommendations")
async def generate_recommendations(
    conversation_id: str,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    return await career_router.generate_recommendations_for_conversation(conversation_id, current_user, db)

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(career_router.get_current_user),
    db: Session = Depends(get_db)
):
    # Find the conversation
    db_conversation = db.query(DBConversation).filter(
        DBConversation.id == conversation_id,
        DBConversation.user_id == current_user.id
    ).first()
    
    if not db_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete the conversation
    db.delete(db_conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}