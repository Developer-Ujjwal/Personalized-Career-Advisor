import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

export default function TestReactFlow() {
  const nodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: '2', position: { x: 200, y: 0 }, data: { label: 'Node 2' } },
  ];
  
  const edges = [
    { id: 'e1-2', source: '1', target: '2' },
  ];

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
}