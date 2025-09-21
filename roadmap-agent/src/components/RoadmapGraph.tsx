import React, { useState, useCallback, useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import type { Node, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import type { RoadmapNode, RoadmapEdge, StepDetails } from "../types/roadmap";
import StepModal from "./StepModal";
import { getStepDetails } from "../lib/gemini";
import { Clock, ChevronRight } from "lucide-react";

interface Props {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  overallGoal: string;
}

// Custom node component - OUTSIDE the main component to prevent recreation
const CustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="relative group">
      {/* Main card with modern styling */}
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 transform hover:-translate-y-1 min-w-[240px] max-w-[280px] backdrop-blur-sm">
        
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
        
        {/* Header section */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-sm leading-tight">
              {data.label}
            </h3>
          </div>
          <div className="ml-2 p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
            <ChevronRight className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-all duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
        
        {data.step && (
          <div className="space-y-3">
            {/* Description */}
            {data.step.description && (
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{data.step.description}</p>
            )}
            
            {/* Duration badge */}
            {data.step.duration && (
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-1.5 rounded-full w-fit">
                <Clock className="w-3 h-3 mr-1.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">{data.step.duration}</span>
              </div>
            )}
            
            {/* Skills section */}
            {data.step.skills && data.step.skills.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {data.step.skills.slice(0, 3).map((skill: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-200 hover:from-blue-200 hover:to-cyan-200 transition-all duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {data.step.skills.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200">
                      +{data.step.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Resources preview */}
            {data.step.resources && data.step.resources.length > 0 && (
              <div className="text-xs text-purple-600 font-medium">
                {data.step.resources.length} resource{data.step.resources.length !== 1 ? 's' : ''} available
              </div>
            )}
          </div>
        )}
        
        {/* Call to action */}
        <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
          <span className="text-xs text-blue-600 font-semibold">Click for details</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      {/* Connection points */}
      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

// nodeTypes defined OUTSIDE component to prevent recreation warning
const nodeTypes = {
  custom: CustomNode,
};

export default function RoadmapGraph({ nodes, edges, overallGoal }: Props) {
  const [selectedStep, setSelectedStep] = useState<StepDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleNodeClick = useCallback(async (_event: React.MouseEvent, node: Node) => {
    if (node.data.step) {
      setIsLoadingDetails(true);
      setIsModalOpen(true);
      setSelectedStep(null);
      
      try {
        console.log('Fetching details for step:', node.data.step.title);
        const stepDetails = await getStepDetails(node.data.step, overallGoal);
        setSelectedStep(stepDetails);
      } catch (error) {
        console.error('Error fetching step details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  }, [overallGoal]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStep(null);
  };

  // Memoize the processed nodes and edges to prevent unnecessary recalculations
  const { processedNodes, validEdges } = useMemo(() => {
    console.log('🔍 Processing nodes and edges - Input nodes:', nodes.length);
    // Note: Currently auto-generating edges, but could use provided edges in future
    console.log('📝 Provided edges for reference:', edges.length);
    
    // Early return if no nodes
    if (!nodes.length) {
      return { processedNodes: [], validEdges: [] };
    }

    // Process nodes with safer ID handling and better structure validation
    const processedNodes = nodes
      .filter((node, index) => {
        // More thorough node validation
        const isValid = node && 
          typeof node === 'object' && 
          (node.id !== undefined && node.id !== null && node.id !== '');
        
        if (!isValid) {
          console.warn(`⚠️ Filtering out invalid node at index ${index}:`, node);
        }
        return isValid;
      })
      .map((node, index) => {
        // Ensure ID is always a valid string
        const nodeId = String(node.id).trim();
        
        // Create position if missing - spread nodes horizontally
        const position = node.position || { 
          x: index * 300, 
          y: 100 + (index % 2) * 150  // Slight vertical offset for better layout
        };

        // Ensure data structure exists and has required fields
        const data = {
          ...node.data,
          label: node.data.label || `Step ${index + 1}`,
          step: node.data.step || null
        };

        return {
          ...node,
          id: nodeId,
          type: 'custom', // Switch back to beautiful custom nodes
          position,
          data,
          // Add some default node properties that React Flow expects
          draggable: true,
          selectable: true,
        };
      });

    console.log('✅ Processed nodes:', processedNodes.map(n => ({ 
      id: n.id, 
      type: typeof n.id,
      label: n.data.label 
    })));

    // Generate edges between consecutive nodes - beautiful animated edges
    const autoEdges = processedNodes.length > 1
      ? processedNodes.slice(0, -1).map((node, idx) => {
          const sourceId = String(node.id);
          const targetId = String(processedNodes[idx + 1].id);
          
          return {
            id: `edge-${idx}`,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: 'url(#gradient)', 
              strokeWidth: 3,
              filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))'
            },
            markerEnd: { 
              type: MarkerType.ArrowClosed, 
              color: '#2563eb',
              width: 20,
              height: 20
            },
            data: {
              stepNumber: idx + 1
            }
          };
        })
      : [];

    // Add a test edge to see if React Flow can render any edges at all
    const testEdge = processedNodes.length >= 2 ? [{
      id: 'test-edge',
      source: String(processedNodes[0].id),
      target: String(processedNodes[1].id),
      style: { stroke: '#ff0000', strokeWidth: 3 }, // Red thick line for visibility
      type: 'default'
    }] : [];

    // Combine auto edges with test edge
    const allEdges = [...autoEdges, ...testEdge];

    // Validate that all edge sources and targets exist in processed nodes
    const nodeIds = new Set(processedNodes.map(n => String(n.id)));
    const validEdges = allEdges.filter(edge => {
      const sourceExists = nodeIds.has(String(edge.source));
      const targetExists = nodeIds.has(String(edge.target));
      const isValid = sourceExists && targetExists;
      
      if (!isValid) {
        console.warn(`⚠️ Invalid edge filtered out:`, {
          edge: edge.id,
          source: edge.source,
          target: edge.target,
          sourceExists,
          targetExists,
          availableNodeIds: Array.from(nodeIds)
        });
      }
      return isValid;
    });

    console.log('🔗 Generated edges:', validEdges.map(e => ({ 
      id: e.id, 
      source: e.source, 
      target: e.target 
    })));

    return { processedNodes, validEdges };
  }, [nodes, edges]); // Only recalculate when input nodes or edges change

  // Early return for empty data
  if (!nodes.length) {
    return <p className="p-4">No roadmap data yet.</p>;
  }

  // Additional validation before rendering
  if (processedNodes.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">No valid nodes could be processed. Please check your data structure.</p>
        <pre className="mt-2 text-xs text-gray-600">
          Raw nodes: {JSON.stringify(nodes.slice(0, 2), null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <strong className="text-blue-800">Roadmap Status:</strong>
            <span className="ml-2 text-blue-700">
              {processedNodes.length} steps, {validEdges.length} connections
            </span>
          </div>
          <div className="text-xs text-blue-600">
            Node IDs: {processedNodes.slice(0, 3).map(n => `"${n.id}"`).join(', ')}
            {processedNodes.length > 3 && '...'}
          </div>
        </div>
        {validEdges.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Edges: {validEdges.map(e => `${e.source}→${e.target}`).join(', ')}
          </div>
        )}
        {validEdges.length === 0 && processedNodes.length > 1 && (
          <div className="mt-2 text-xs text-red-600">
            ⚠️ No edges created despite having {processedNodes.length} nodes
          </div>
        )}
      </div>
      
      <div className="h-[700px] border-2 border-gray-200 rounded-xl m-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 shadow-lg overflow-hidden relative">
        {/* SVG Definitions for gradients */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        
        <ReactFlow 
          nodes={processedNodes} 
          edges={validEdges} 
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ 
            padding: 0.3, 
            maxZoom: 1.0, 
            minZoom: 0.4 
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          className="roadmap-flow"
        >
          <Background 
            color="#e2e8f0" 
            gap={24} 
            size={2}
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
              opacity: 0.4
            }}
          />
          <Controls />
        </ReactFlow>
      </div>

      <StepModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        stepDetails={selectedStep}
        isLoading={isLoadingDetails}
      />
    </>
  );
}