from model import Roadmap, RoadmapStep, StepDetails
import json
from setup import model

class RoadmapAgent:
    def __init__(self):
        self.model = model

    async def generate_career_roadmap(self, conversation_history: list | None, user_profile: dict | None, goal: str) -> Roadmap:
        """Generate a career roadmap using conversation context and user profile when available.

        conversation_history: list of conversation items (from DB) where each item is a dict with 'role' and 'parts'
        user_profile: dict extracted from the conversation (may include education, field_of_study, experience_level, skills, interests)
        goal: target career goal string
        """
        # Derive a sensible 'start' from the user profile if available
        start = ""
        try:
            if isinstance(user_profile, dict):
                # prefer explicit education_level, fallback to education or current_grade
                start = user_profile.get("education_level") or user_profile.get("education") or user_profile.get("current_grade") or ""
        except Exception:
            start = ""

        if not start:
            start = "Current position"  # friendly default

        # Build conversation context string (recent exchanges) for the prompt
        convo_context = ""
        try:
            if conversation_history and isinstance(conversation_history, list):
                recent = conversation_history[-8:] if len(conversation_history) > 8 else conversation_history
                parts = []
                for item in recent:
                    role = item.get("role", "")
                    content = ""
                    if item.get("parts") and isinstance(item.get("parts"), list) and len(item.get("parts")) > 0:
                        content = item.get("parts")[0]
                    if role and content:
                        if role.lower() == "assistant":
                            parts.append(f"Agent: {content}")
                        elif role.lower() == "user":
                            parts.append(f"User: {content}")
                convo_context = "\n".join(parts)

        except Exception:
            convo_context = ""

        # Include user_profile json for context
        profile_json = "{}"
        try:
            if user_profile and isinstance(user_profile, dict):
                profile_json = json.dumps(user_profile, indent=2)
        except Exception:
            profile_json = "{}"

        prompt = f"""
You are an expert career roadmap generator creating a CONNECTED flowchart.
Current position: "{start}"  
Goal: "{goal}".  

Conversation context (recent exchanges):
{convo_context}

User profile/context:
{profile_json}

Create a step-by-step roadmap with PROPERLY CONNECTED nodes showing the career progression path.

CRITICAL REQUIREMENTS:
1. Start with node "1" representing current position: "{start}"
2. End with the final node representing: "Goal: {goal}"
3. Create 6-12 intermediate steps that logically connect from start to goal
4. EVERY node must be connected with edges - no isolated nodes
5. Use a linear progression with occasional branches for alternative paths
6. Position nodes horizontally (x-axis) to show progression over time

JSON Structure Required:
{{{{  
  "nodes": [
    {{ "id": "1", "data": {{ "label": "Current: {start}", "skills": [], "experience": "Starting point" }}, "position": {{ "x": 0, "y": 0 }} }},
    {{ "id": "2", "data": {{ "label": "Learn Foundation Skills", "skills": ["Skill A", "Skill B"], "experience": "3-6 months" }}, "position": {{ "x": 200, "y": 0 }} }},
    {{ "id": "3", "data": {{ "label": "Complete First Project/Course", "skills": ["Skill C"], "experience": "6-9 months" }}, "position": {{ "x": 400, "y": 0 }} }},
    {{ "id": "4", "data": {{ "label": "Get Certification/Internship", "skills": ["Skill D"], "experience": "9-12 months" }}, "position": {{ "x": 600, "y": -100 }} }},
    {{ "id": "5", "data": {{ "label": "Alternative: Self-taught Path", "skills": ["Skill E"], "experience": "9-15 months" }}, "position": {{ "x": 600, "y": 100 }} }},
    {{ "id": "6", "data": {{ "label": "Advanced Skills & Experience", "skills": ["Skill F"], "experience": "1-2 years" }}, "position": {{ "x": 800, "y": 0 }} }},
    {{ "id": "7", "data": {{ "label": "Goal: {goal}", "skills": [], "experience": "2-3 years total" }}, "position": {{ "x": 1000, "y": 0 }} }}
  ],
  "edges": [
    {{ "id": "e1-2", "source": "1", "target": "2" }},
    {{ "id": "e2-3", "source": "2", "target": "3" }},
    {{ "id": "e3-4", "source": "3", "target": "4" }},
    {{ "id": "e3-5", "source": "3", "target": "5" }},
    {{ "id": "e4-6", "source": "4", "target": "6" }},
    {{ "id": "e5-6", "source": "5", "target": "6" }},
    {{ "id": "e6-7", "source": "6", "target": "7" }}
  ]
}}}}

MANDATORY RULES:
- Create 6-12 nodes total (including start and goal)
- EVERY node must have at least one incoming or outgoing edge
- Use sequential numbering: "1", "2", "3", etc.
- Edge IDs must follow pattern: "e1-2", "e2-3", etc.
- Position nodes with x-coordinates: 0, 300, 600, 900, 1200... (300px spacing minimum)
- For branches, use different y-coordinates: -150, 0, 150 (150px spacing minimum)
- Include specific skills and realistic timeframes
- Make each step actionable and achievable
- Connect all paths back to the final goal
- Avoid overlapping nodes - ensure minimum 250px spacing between any two nodes
- Return ONLY JSON, no explanations or markdown

POSITIONING GUIDELINES:
- Main path: y = 0
- Upper branch: y = -150 
- Lower branch: y = 150
- Minimum x-spacing: 300px
- Maximum 3 nodes at same x-coordinate (different y-values)

Focus on creating a VISUALLY CONNECTED roadmap that flows logically from "{start}" to "{goal}" with CLEAR SPACING."""
        
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.strip()
            
            # Remove any markdown formatting
            text = text.replace("```json", "").replace("```", "").strip()
            
            parsed = json.loads(text)

            if not parsed.get("nodes") or not parsed.get("edges"):
                raise ValueError("❌ Roadmap missing nodes/edges")

            processed_nodes = []
            for node in parsed["nodes"]:
                step_data = RoadmapStep(
                    id=node["id"],
                    title=node["data"]["label"],
                    description=f"Learn {', '.join(node['data'].get('skills', [])) or 'required skills'} with {node['data'].get('experience', 'flexible timeline')}",
                    duration=node["data"].get("experience", "Flexible"),
                    skills=node["data"].get("skills", []),
                    resources=[],
                    milestones=[],
                )
                node["data"]["step"] = step_data.model_dump()
                processed_nodes.append(node)

            return Roadmap(nodes=processed_nodes, edges=parsed["edges"])
        except Exception as e:
            print(f"❌ Error in generate_career_roadmap: {e}")
            raise

    async def get_roadmap_step_details(self, step: RoadmapStep, overall_goal: str) -> dict:
        print(f"🔍 Getting detailed information for step: {step.title}")

        prompt = f"""You are an expert career advisor and learning specialist. Provide detailed information for this learning step:

Step: "{step.title}"
Description: "{step.description}"
Overall Goal: "{overall_goal}"
Skills mentioned: {json.dumps(step.skills) if hasattr(step, 'skills') and step.skills else 'None'}

Please provide a comprehensive response in JSON format with the following structure:
{{
  "step": {{
    "id": "{step.id}",
    "title": "{step.title}",
    "description": "{step.description}",
    "skills": {json.dumps(step.skills if hasattr(step, 'skills') and step.skills else [])},
    "resources": {json.dumps(step.resources or [])}
  }},
  "skillDetails": [
    {{
      "name": "skill name",
      "description": "detailed explanation of what this skill is and why it's important",
      "learningPath": [
        "step 1 - what to learn first",
        "step 2 - what to learn next",
        "step 3 - advanced concepts"
      ],
      "practiceProjects": [
        "project 1 - beginner level practice",
        "project 2 - intermediate practice",
        "project 3 - advanced application"
      ],
      "resources": [
        {{
          "type": "course",
          "title": "resource title",
          "url": "https://example.com (if available)",
          "description": "why this resource is helpful"
        }}
      ],
      "timeToLearn": "estimated time like '2-4 weeks' or '1-2 months'",
      "difficulty": "Beginner|Intermediate|Advanced"
    }}
  ],
  "tips": [
    "practical tip 1 for learning this step effectively",
    "practical tip 2 for staying motivated",
    "practical tip 3 for applying knowledge"
  ],
  "commonMistakes": [
    "common mistake 1 that learners make",
    "common mistake 2 to avoid",
    "common mistake 3 and how to prevent it"
  ],
  "successMetrics": [
    "metric 1 - how to know you've mastered this",
    "metric 2 - what you should be able to do",
    "metric 3 - signs of competency"
  ]
}}

For each skill in the step, provide detailed learning paths, practice projects, and specific resources. Focus on actionable, practical advice that helps someone actually learn and apply these skills. Include real project ideas they can build to practice."""

        try:
            response = await self.model.generate_content_async(prompt)
            cleaned_response = response.text.strip()

            # Remove markdown code blocks if present
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response.replace("```json", "").replace("```", "").strip()
            elif cleaned_response.startswith("```"):
                cleaned_response = cleaned_response.replace("```", "").strip()

            step_details_data = json.loads(cleaned_response)

            # Validate the response structure
            if (
                "step" not in step_details_data
                or "skillDetails" not in step_details_data
                or not isinstance(step_details_data["skillDetails"], list)
            ):
                raise ValueError("Invalid step details structure received from API")

            return StepDetails(**step_details_data)
        except Exception as e:
            print(f"❌ Error getting step details: {e}")
            raise