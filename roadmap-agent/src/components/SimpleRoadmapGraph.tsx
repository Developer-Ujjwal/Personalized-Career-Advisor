import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import type { RoadmapNode, RoadmapEdge } from "../types/roadmap";

interface Props {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export default function SimpleRoadmapGraph({ nodes, edges }: Props) {
  console.log('🔍 SimpleRoadmapGraph - Nodes:', nodes);
  console.log('🔍 SimpleRoadmapGraph - Edges:', edges);
  
  // Simple nodes for testing
  const simpleNodes = nodes.map(node => ({
    id: node.id,
    position: node.position,
    data: { label: node.data.label || 'Test Node' },
    type: 'default'
  }));

  // Simple edges for testing  
  const simpleEdges = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
    style: { strokeWidth: 2, stroke: '#3b82f6' }
  }));

  if (!nodes.length) return <p className="p-4">No roadmap data yet.</p>;

  return (
    <div className="h-[600px] border rounded m-4 bg-white">
      <ReactFlow 
        nodes={simpleNodes} 
        edges={simpleEdges} 
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}