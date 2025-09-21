import { useEffect, useState } from "react";
import InputForm from "./components/InputForm";
import RoadmapGraph from "./components/RoadmapGraph";
import { getRoadmap, testApiConnection } from "./lib/gemini";
import type { RoadmapNode, RoadmapEdge } from "./types/roadmap";

export default function App() {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [edges, setEdges] = useState<RoadmapEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGoal, setCurrentGoal] = useState<string>("");

  useEffect(() => {
    testApiConnection();
  }, []);

  const handleSubmit = async (start: string, goal: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentGoal(goal);
      const roadmap = await getRoadmap(start, goal);
      setNodes(roadmap.nodes || []);
      setEdges(roadmap.edges || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold p-4">Career Roadmap Generator</h1>
      <InputForm onSubmit={handleSubmit} />
      {loading && <p className="p-4">⏳ Generating roadmap...</p>}
      {error && <p className="p-4 text-red-500">❌ {error}</p>}
      {nodes.length > 0 && (
        <RoadmapGraph nodes={nodes} edges={edges} overallGoal={currentGoal} />
      )}
    </div>
  );
}
