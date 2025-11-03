import google.generativeai as genai
from model import Profile, CareerRecommendationsResponse, CareerKeywordsResponse, HexacoScores, HollandScores
import json
import random
from setup import model
from trends import CareerTrendAnalyzer


class DynamicCareerGuidanceAgent:
    def __init__(self):
        # Initial system prompt
        self.system_prompt = """
        You are a friendly and encouraging career guidance expert helping students and professionals find suitable career paths.
        Your goal is to ask simple, open-ended questions to understand the person's interest, skills, values and preferences.
        
        Question Guidelines:
        - Always ask OPEN-ENDED questions (use "what", "how", "tell me about", "describe" - NEVER yes/no questions)
        - Keep questions SHORT and SIMPLE (maximum 15-20 words)
        - Ask ONE thing at a time
        - Use warm, conversational language
        - Make questions easy to answer in 2-3 sentences
        
        Information gathering order:
        1. Current education status and background
        2. Interests, hobbies, and what they enjoy doing
        3. Skills and strengths they recognize in themselves
        4. Work environment preferences (team vs solo, structured vs flexible)
        5. Values and what matters to them in a career
        6. Career aspirations and goals
        
        Important: Be encouraging, supportive, and conversational. Make the person feel comfortable sharing.
        """

        self.trend_analyzer = CareerTrendAnalyzer()

    def generate_question(self, conversation_history: list, hexaco_scores: HexacoScores = None, holland_scores: HollandScores = None) -> str:
        """Generate a dynamic question based on conversation history using Gemini"""
        try:
            prompt_parts = [
                "You are a friendly career guidance expert. Generate ONE simple, open-ended question to gather information about the user's interests, skills, values and preferences, dislikes and many traits to help them find suitable careers.",
                "",
                "CRITICAL REQUIREMENTS:",
                "1. The question MUST be OPEN-ENDED (use 'what', 'how', 'tell me', 'describe', 'share' - NEVER use yes/no questions)",
                "2. Keep it SHORT and SIMPLE (15-20 words maximum)",
                "3. Make it EASY to answer (someone should be able to respond in 2-3 sentences)",
                "4. Use warm, conversational, and encouraging tone",
                "5. Ask about ONE specific thing at a time",
                "",
                "Conversation so far:",
            ]
            
            # Add relevant conversation context (last 3-4 exchanges)
            recent_history = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
            for item in recent_history:
                if isinstance(item, dict):
                    role = item.get("role", "")
                    parts = item.get("parts", [])
                    if parts:
                        if role == "assistant":
                            prompt_parts.append(f"You asked: {parts[0]}")
                        elif role == "user":
                            # Truncate long responses for context
                            response = parts[0][:100] + "..." if len(parts[0]) > 100 else parts[0]
                            prompt_parts.append(f"User responded: {response}")
            
            # Add personality assessment information if available (for context-aware questions)
            context_info = []
            if hexaco_scores:
                context_info.append("User has completed HEXACO personality assessment")
            if holland_scores:
                context_info.append("User has completed Holland RIASEC career interest assessment")
            
            if context_info:
                prompt_parts.append("")
                prompt_parts.append("Additional context: " + ", ".join(context_info))
            
            prompt_parts.append("")
            prompt_parts.append("Generate ONLY the question, nothing else. No explanations, no prefixes. Just the question:")
            
            prompt = "\n".join(prompt_parts)
            response = model.generate_content(prompt)
            question = response.text.strip()
            
            # Clean up the question (remove quotes, prefixes like "Question:" etc.)
            question = question.replace('"', '').replace("'", "")
            if question.lower().startswith("question:"):
                question = question[9:].strip()
            if question.lower().startswith("here's a question:"):
                question = question[17:].strip()
            
            return question

        except Exception as e:
            # Fallback questions if API call fails - all open-ended and simple
            fallback_questions = [
                "Tell me about your current education level and what you're studying.",
                "What subjects or topics do you find most interesting?",
                "What activities do you enjoy doing in your free time?",
                "What skills do you think you're naturally good at?",
                "Describe the kind of work environment where you feel most comfortable.",
                "What matters most to you when thinking about a future career?",
                "What are some career goals you've been thinking about?"
            ]
            return random.choice(fallback_questions)

    def extract_profile_info(self,question:str, response: str):
        """Extract key information from user response to build profile"""
        try:
            prompt = f"""
            Extract key information from this user response for career guidance purposes:

            Question:
            {question}
            Response:
            {response}

            Extract and categorize the following information if mentioned:
            1. Interests/hobbies/passions
            2. Skills/abilities
            3. Personality traits
            4. Values/career preferences
            5. Education level
            6. Experience level

            Return the information in JSON format with these categories.
            If a category isn't mentioned, set it to an empty list or empty string.
            """

            # Generate JSON schema from Pydantic model manually to avoid Gemini's schema conversion issues
            profile_schema = {
                "type": "object",
                "properties": {
                    "interests": {"type": "array", "items": {"type": "string"}},
                    "skills": {"type": "array", "items": {"type": "string"}},
                    "personality_traits": {"type": "array", "items": {"type": "string"}},
                    "values": {"type": "array", "items": {"type": "string"}},
                    "education": {"type": "string"},
                    "experience_level": {"type": "string"},
                    "dislikes": {"type": "array", "items": {"type": "string"}}
                },
                "required": []
            }
            
            result = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=profile_schema)
            )

            # Try to parse JSON from response
            try:
                extracted_data = json.loads(result.text)
                
                # Ensure all fields have proper defaults if missing
                if "interests" not in extracted_data:
                    extracted_data["interests"] = []
                if "skills" not in extracted_data:
                    extracted_data["skills"] = []
                if "personality_traits" not in extracted_data:
                    extracted_data["personality_traits"] = []
                if "values" not in extracted_data:
                    extracted_data["values"] = []
                if "dislikes" not in extracted_data:
                    extracted_data["dislikes"] = []
                if "education" not in extracted_data:
                    extracted_data["education"] = ""
                if "experience_level" not in extracted_data:
                    extracted_data["experience_level"] = ""
                
                # Validate against Profile model
                profile = Profile(**extracted_data)
                print(f"Extracted profile: {extracted_data}")
                return extracted_data
            except json.JSONDecodeError:
                # If JSON parsing fails, use keyword matching as fallback
                print("JSON parsing failed. Using keyword matching.")
                return None
            except Exception as validation_error:
                print(f"Profile validation error: {validation_error}")
                # Return the extracted data anyway, even if validation fails
                return extracted_data

        except Exception as e:
          print("Error extracting profile information:", e)

    def extract_career_keywords(self, user_profile: dict):
        """Use Gemini to map profile into concrete career/skill keywords for trend analysis"""
        try:
            prompt = f"""
            Based on the following user profile, suggest 5-7 specific career roles or skills 
            that can be checked against market demand trends. 
            Return only a JSON array of career keywords.

            User Profile:
            {json.dumps(user_profile, indent=2)}
            """

            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=CareerKeywordsResponse))
            print(response.text)
            return json.loads(response.text)

        except Exception as e:
            print("Error extracting career keywords:", e)
            return []

    def generate_recommendations(self, user_profile: dict, hexaco_scores: HexacoScores = None, holland_scores: HollandScores = None) -> CareerRecommendationsResponse:
        """Generate career recommendations based on the user profile and personality assessments"""
        try:
            print(f"User Profile: {user_profile}")
            print(f"HEXACO scores: {hexaco_scores}")
            print(f"Holland RIASEC scores: {holland_scores}")
            career_keywords = self.extract_career_keywords(user_profile)
            trending_info = self.trend_analyzer.analyze_career_demand(career_keywords) 
            print(trending_info)
            
            # Calculate influence breakdown
            influence_breakdown = {}
            available_inputs = 0
            
            if hexaco_scores:
                available_inputs += 1
            if holland_scores:
                available_inputs += 1
            if user_profile and any(user_profile.values()):
                available_inputs += 1
                
            # Distribute weights based on available inputs
            if available_inputs == 3:
                influence_breakdown = {
                    "HEXACO": 25.0,
                    "Holland": 35.0,
                    "Interests": 40.0
                }
            elif available_inputs == 2:
                if not hexaco_scores:
                    influence_breakdown = {
                        "Holland": 50.0,
                        "Interests": 50.0
                    }
                elif not holland_scores:
                    influence_breakdown = {
                        "HEXACO": 50.0,
                        "Interests": 50.0
                    }
                else:
                    influence_breakdown = {
                        "HEXACO": 50.0,
                        "Holland": 50.0
                    }
            elif available_inputs == 1:
                if hexaco_scores:
                    influence_breakdown = {"HEXACO": 100.0}
                elif holland_scores:
                    influence_breakdown = {"Holland": 100.0}
                else:
                    influence_breakdown = {"Interests": 100.0}
            
            # Build the prompt based on available assessment data
            prompt = f"""
            Based on the following user profile and assessment data, suggest 3-5 suitable career paths that align with their skills/interests and personality characteristics.
            
            User Profile:
            {json.dumps(user_profile, indent=2)}
            
            Influence Breakdown:
            {json.dumps(influence_breakdown, indent=2)}
            """
            
            # Add personality assessment information if available
            if hexaco_scores:
                prompt += f"""
                
                HEXACO Personality Assessment: 
                {hexaco_scores.model_dump_json()}
                """
                
            if holland_scores:
                prompt += f"""
                
                Holland RIASEC Career Interests:
                {holland_scores.model_dump_json()}
                """
                
            prompt += f"""
            
            Career Demand Trends (from Google Trends or related data):
            {json.dumps(trending_info, indent=2)}
            
            Your recommendations should balance:
            1. Personal fit based on their skills and interests
            2. Personality assessment alignment (HEXACO and/or Holland RIASEC) with the influence breakdown
            3. Current market demand from the trend data
            
            Use the provided influence breakdown to weight each factor's importance.
            Return strictly in this JSON schema
            """
        
            # Define JSON schema manually to avoid issues with Dict types (influence_breakdown)
            recommendations_schema = {
                "type": "object",
                "properties": {
                    "recommendations": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "career_name": {"type": "string"},
                                "fit_explanation": {"type": "string"},
                                "required_skills_education": {"type": "string"},
                                "potential_growth": {"type": "string"}
                            },
                            "required": ["career_name", "fit_explanation", "required_skills_education", "potential_growth"]
                        }
                    },
                    "additional_advice": {"type": "string"}
                },
                "required": ["recommendations", "additional_advice"]
            }
        
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=recommendations_schema)
            )
            if response is None or response.text is None:
                raise Exception("No response from Gemini")
            elif not response.text.startswith('{') or not response.text.endswith('}'):
                raise Exception("Invalid JSON response from Gemini")
            else:
                recommendations_dict = json.loads(response.text)
                recommendations_dict["influence_breakdown"] = influence_breakdown
                recommendations = CareerRecommendationsResponse(**recommendations_dict)

            print(recommendations)

            return recommendations
        
        except Exception as e:
            if "No response from Gemini" in str(e):
                print("Gemini did not return any response")
            elif "Invalid JSON response from Gemini" in str(e):
                print("Gemini returned an invalid JSON response")
            else:
                print("An error occurred:", e)
            return CareerRecommendationsResponse(
                recommendations=[], 
                additional_advice="I apologize, but I'm having trouble generating recommendations at the moment. Please try again later.",
                influence_breakdown={}
            )

if __name__ == "__main__":
    agent = DynamicCareerGuidanceAgent()
    agent.conduct_session(5)

