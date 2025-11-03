import os
import sqlalchemy
from sqlalchemy import Column, String, Float, ForeignKey, Text, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from google.cloud.sql.connector import Connector
from dotenv import load_dotenv

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./genai-hackthon-472810-db799b456c6a.json"

connector = Connector()
load_dotenv()

def getconn():
    instance_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")
    if not instance_connection_name:
        raise RuntimeError(
            "CLOUD_SQL_CONNECTION_NAME env var not set. Expected format 'project:region:instance'."
        )
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASS", "")
    db_name = os.getenv("DB_NAME", "postgres")
    conn = connector.connect(
        instance_connection_name,
        "pg8000",
        user=db_user,
        password=db_pass,
        db=db_name,
        ip_type="public"
    )
    return conn

def close_connector():
    global connector
    if connector is not None:
        connector.close()

engine = sqlalchemy.create_engine("postgresql+pg8000://", creator=getconn)
    

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

JsonType = JSON

class DBUser(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    conversation_history = Column(JsonType, default=list)
    user_profile = Column(JsonType, default=dict)
    career_recommendations = Column(JsonType, default=list)
    additional_advice = Column(Text, default="")

    hexaco_scores = relationship("DBHexacoScores", back_populates="user", uselist=False)
    holland_scores = relationship("DBHollandScores", back_populates="user", uselist=False)
    conversations = relationship("DBConversation", back_populates="user", cascade="all, delete-orphan")

class DBHexacoScores(Base):
    __tablename__ = "hexaco_scores"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    honesty_humility = Column(Float, default=0.0)
    emotionality = Column(Float, default=0.0)
    extraversion = Column(Float, default=0.0)
    agreeableness = Column(Float, default=0.0)
    conscientiousness = Column(Float, default=0.0)
    openness_to_experience = Column(Float, default=0.0)
    
    user = relationship("DBUser", back_populates="hexaco_scores")

class DBHollandScores(Base):
    __tablename__ = "holland_scores"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    realistic = Column(Float, default=0.0)
    investigative = Column(Float, default=0.0)
    artistic = Column(Float, default=0.0)
    social = Column(Float, default=0.0)
    enterprising = Column(Float, default=0.0)
    conventional = Column(Float, default=0.0)
    
    user = relationship("DBUser", back_populates="holland_scores")

class DBRoadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    career_goal = Column(String, nullable=False)
    career_start = Column(String, nullable=False)
    nodes = Column(JsonType, default=list)
    edges = Column(JsonType, default=list)

    user = relationship("DBUser")

class DBConversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="New Chat")
    messages = Column(JsonType, default=list)
    conversation_history = Column(JsonType, default=list)
    user_profile = Column(JsonType, default=dict)
    career_recommendations = Column(JsonType, default=list)
    additional_advice = Column(Text, default="")
    influence_breakdown = Column(JsonType, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("DBUser", back_populates="conversations")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)