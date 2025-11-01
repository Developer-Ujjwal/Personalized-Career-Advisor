import google.generativeai as genai
from model import Profile, CareerRecommendationsResponse, CareerKeywordsResponse, HexacoScores
import json
import random
from setup import model
from trends import CareerTrendAnalyzer


class DynamicCareerGuidanceAgent:
    def __init__(self):
        # Initial system prompt
        self.system_prompt = """
        You are a career guidance expert helping students and professionals find suitable career paths.
        Your goal is to ask insightful questions to understand the person's interests, skills, personality,
        values, education level, and experience. Based on their responses, you should generate follow-up
        questions to dive deeper into aspects that are most relevant for career guidance.

        After gathering enough information, you should analyze their profile and suggest 3-5 suitable
        career paths with explanations for why each career might be a good fit.

        Important: Always be encouraging, professional, and focused on helping the person discover
        careers that align with their unique combination of traits and aspirations.
        """

        self.trend_analyzer = CareerTrendAnalyzer()

    def generate_question(self, conversation_history: list, hexaco_scores: HexacoScores) -> str:
        """Generate a dynamic question based on conversation history using Gemini"""
        try:
            # Create prompt for question generation
            prompt_parts = [
                "Based on the conversation so far, generate the next question to better understand the person ",
                "for career guidance purposes. Focus on aspects that haven't been covered yet or need more detail.",
                "The question should be open-ended and encourage thoughtful responses.",
                "Conversation history:",
                str(conversation_history),
                f"HEXACO Personality Type of the User is: {hexaco_scores.model_dump_json()}. HEXACO measures six dimensions: Honesty-Humility, Emotionality, eXtraversion, Agreeableness, Conscientiousness, and Openness to Experience.",
                "Generate just the question without any additional text:"
            ]

            prompt = "\n".join(prompt_parts)
            response = model.generate_content(prompt)
            return response.text.strip()

        except Exception as e:
            # Fallback questions if API call fails
            fallback_questions = [
                "What are you most passionate about?",
                "What skills do you enjoy using the most?",
                "Describe your ideal work environment.",
                "What kind of problems do you enjoy solving?",
                "What values are most important to you in a career?",
                "What subjects did you enjoy most in school?",
                "What are your long-term career aspirations?"
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

            result = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=Profile)
            )

            # Try to parse JSON from response
            try:
                extracted_data = json.loads(result.text)
                print(extracted_data)
                return extracted_data
                # Update user profile with extracted data
            except json.JSONDecodeError:
                # If JSON parsing fails, use keyword matching as fallback
                print("JSON parsing failed. Using keyword matching.")

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

    def generate_recommendations(self, user_profile: dict, hexaco_scores: HexacoScores = None) -> CareerRecommendationsResponse:
        """Generate career recommendations based on the user profile and personality type"""
        try:
            print(f"User Profile: {user_profile}")
            print(f"Personality type: {hexaco_scores}")
            career_keywords = self.extract_career_keywords(user_profile)
            trending_info = self.trend_analyzer.analyze_career_demand(career_keywords) 
            print(trending_info)
            prompt = f"""
            Based on the following user profile and personality type, suggest 3-5 suitable career paths that align with both their skills/interests and personality characteristics.
            
            User Profile:
            {json.dumps(user_profile, indent=2)}
        
                    
            Personality Type: 
            {hexaco_scores.model_dump_json()}
        
            Career Demand Trends (from Google Trends or related data):
            {json.dumps(trending_info, indent=2)}
        
            Your recommendations should balance:
            1. Personal fit based on their skills and interests
            2. Personality type alignment
            3. Current market demand from the trend data
            Return strictly in this JSON schema
            """
        
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=CareerRecommendationsResponse)
            )
            if response is None or response.text is None:
                raise Exception("No response from Gemini")
            elif not response.text.startswith('{') or not response.text.endswith('}'):
                raise Exception("Invalid JSON response from Gemini")
            else:
                recommendations_dict = json.loads(response.text)
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
            return CareerRecommendationsResponse(recommendations=[], additional_advice="I apologize, but I'm having trouble generating recommendations at the moment. Please try again later.")

if __name__ == "__main__":
    agent = DynamicCareerGuidanceAgent()
    agent.conduct_session(5)

