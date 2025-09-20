from google.adk.agents import Agent, LoopAgent, SequentialAgent

# Agent to generate questions based on user's previous responses
question_generator = Agent(
    name="question_generator",
    model="gemini-2.0-flash",
    description="Generates personalized questions to better understand user interests and aspirations.",
    instruction=(
        "You are an expert career counselor helping people explore their interests, skills, and passions. "
        "Based on the conversation history, generate a thoughtful and open-ended question that:\n"
        "1. Builds upon previous responses.\n"
        "2. Covers different aspects such as technical, creative, analytical, social, or leadership interests.\n"
        "3. Encourages the user to provide detailed answers.\n"
        "4. Avoids repeating topics already covered.\n\n"
        "Provide only the next question without any extra explanation."
    ),
)

# Agent to analyze user responses and identify interests
interest_analyzer = Agent(
    name="interest_analyzer",
    model="gemini-2.0-flash",
    description="Analyzes user responses to identify key interests and assign scores based on patterns.",
    instruction=(
        "You are an expert at interpreting user responses to uncover their interests and strengths. "
        "Analyze the response and assign a score from 0 to 10 for each of the following categories based on how strongly they are reflected:\n\n"
        "INTERESTS:\n"
        "- Technical: [Score 0-10]\n"
        "- Creative: [Score 0-10]\n"
        "- Analytical: [Score 0-10]\n"
        "- Social: [Score 0-10]\n"
        "- Leadership: [Score 0-10]\n\n"
        "REASONING:\nProvide a brief explanation of why you assigned these scores based on the user's response."
    ),
)

# Main loop agent that orchestrates the conversation
main_agent = SequentialAgent(
    name="interest_discovery_agent",
    sub_agents=[interest_analyzer, question_generator],
)

root_agent = SequentialAgent(
    name="interest_discovery_agent_wrapper",
    sub_agents=[main_agent] * 5,
    max_iterations=5,  # Engage the user in 5 iterations of main agent
)
