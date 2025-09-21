import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  RoadmapNode,
  RoadmapEdge,
  RoadmapStep,
  StepDetails,
} from "../types/roadmap";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "❌ Missing Gemini API key. Add VITE_GEMINI_API_KEY to your .env file"
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ Test Gemini connection
export async function testApiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello from Gemini!");
    console.log("✅ Gemini response:", result.response.text());
    return true;
  } catch (err) {
    console.error("❌ API connection failed:", err);
    return false;
  }
}

export async function getRoadmap(
  start: string,
  goal: string
): Promise<{ nodes: RoadmapNode[]; edges: RoadmapEdge[] }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert career roadmap generator creating a CONNECTED flowchart.
Current position: "${start}"  
Goal: "${goal}".  

Create a step-by-step roadmap with PROPERLY CONNECTED nodes showing the career progression path.

CRITICAL REQUIREMENTS:
1. Start with node "1" representing current position: "${start}"
2. End with the final node representing: "Goal: ${goal}"
3. Create 6-12 intermediate steps that logically connect from start to goal
4. EVERY node must be connected with edges - no isolated nodes
5. Use a linear progression with occasional branches for alternative paths
6. Position nodes horizontally (x-axis) to show progression over time

JSON Structure Required:
{
  "nodes": [
    { "id": "1", "data": { "label": "Current: ${start}", "skills": [], "experience": "Starting point" }, "position": { "x": 0, "y": 0 } },
    { "id": "2", "data": { "label": "Learn Foundation Skills", "skills": ["Skill A", "Skill B"], "experience": "3-6 months" }, "position": { "x": 200, "y": 0 } },
    { "id": "3", "data": { "label": "Complete First Project/Course", "skills": ["Skill C"], "experience": "6-9 months" }, "position": { "x": 400, "y": 0 } },
    { "id": "4", "data": { "label": "Get Certification/Internship", "skills": ["Skill D"], "experience": "9-12 months" }, "position": { "x": 600, "y": -100 } },
    { "id": "5", "data": { "label": "Alternative: Self-taught Path", "skills": ["Skill E"], "experience": "9-15 months" }, "position": { "x": 600, "y": 100 } },
    { "id": "6", "data": { "label": "Advanced Skills & Experience", "skills": ["Skill F"], "experience": "1-2 years" }, "position": { "x": 800, "y": 0 } },
    { "id": "7", "data": { "label": "Goal: ${goal}", "skills": [], "experience": "2-3 years total" }, "position": { "x": 1000, "y": 0 } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" },
    { "id": "e3-4", "source": "3", "target": "4" },
    { "id": "e3-5", "source": "3", "target": "5" },
    { "id": "e4-6", "source": "4", "target": "6" },
    { "id": "e5-6", "source": "5", "target": "6" },
    { "id": "e6-7", "source": "6", "target": "7" }
  ]
}

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

Focus on creating a VISUALLY CONNECTED roadmap that flows logically from "${start}" to "${goal}" with CLEAR SPACING.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove any markdown formatting
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    console.log("📥 Gemini raw response:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("❌ Invalid JSON from Gemini");
    }

    if (!parsed.nodes || !parsed.edges) {
      throw new Error("❌ Roadmap missing nodes/edges");
    }

    console.log("📊 Generated nodes:", parsed.nodes.length);
    console.log("🔗 Generated edges:", parsed.edges.length);
    console.log("📋 Edges details:", parsed.edges);

    // Convert the parsed nodes to include RoadmapStep data
    const processedNodes = parsed.nodes.map(
      (node: {
        id: string;
        data: { label: string; skills?: string[]; experience?: string };
        position: { x: number; y: number };
      }) => {
        const stepData: RoadmapStep = {
          id: node.id,
          title: node.data.label,
          description: `Learn ${
            node.data.skills?.join(", ") || "required skills"
          } with ${node.data.experience || "flexible timeline"}`,
          duration: node.data.experience || "Flexible",
          skills: node.data.skills || [],
          resources: [],
          milestones: [],
        };

        return {
          ...node,
          data: {
            ...node.data,
            step: stepData,
          },
        };
      }
    );

    return {
      nodes: processedNodes,
      edges: parsed.edges,
    };
  } catch (err) {
    console.error("❌ Error in getRoadmap:", err);
    throw err;
  }
}

export async function getStepDetails(
  step: RoadmapStep,
  overallGoal: string
): Promise<StepDetails> {
  console.log("🔍 Getting detailed information for step:", step.title);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert career advisor and learning specialist. Provide detailed information for this learning step:

Step: "${step.title}"
Description: "${step.description}"
Overall Goal: "${overallGoal}"
Skills mentioned: ${step.skills.join(", ")}

Please provide a comprehensive response in JSON format with the following structure:
{
  "step": {
    "id": "${step.id}",
    "title": "${step.title}",
    "description": "${step.description}",
    "duration": "${step.duration}",
    "skills": ${JSON.stringify(step.skills)},
    "resources": ${JSON.stringify(step.resources || [])},
    "milestones": ${JSON.stringify(step.milestones || [])}
  },
  "skillDetails": [
    {
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
        {
          "type": "course",
          "title": "resource title",
          "url": "https://example.com (if available)",
          "description": "why this resource is helpful"
        }
      ],
      "timeToLearn": "estimated time like '2-4 weeks' or '1-2 months'",
      "difficulty": "Beginner|Intermediate|Advanced"
    }
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
}

For each skill in the step, provide detailed learning paths, practice projects, and specific resources. Focus on actionable, practical advice that helps someone actually learn and apply these skills. Include real project ideas they can build to practice.`;

  try {
    const response = await model.generateContent(prompt);
    console.log("📥 Step details raw response:", response.response.text());

    let cleanedResponse = response.response.text().trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    console.log("🧹 Cleaned step details response:", cleanedResponse);

    const stepDetails = JSON.parse(cleanedResponse);
    console.log("✅ Step details parsed successfully:", stepDetails);

    // Validate the response structure
    if (
      !stepDetails.step ||
      !stepDetails.skillDetails ||
      !Array.isArray(stepDetails.skillDetails)
    ) {
      throw new Error("Invalid step details structure received from API");
    }

    return stepDetails;
  } catch (error) {
    console.error("❌ Error getting step details:", error);
    throw new Error(
      `Failed to get step details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
