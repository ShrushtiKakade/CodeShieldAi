import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  GitFork, 
  AlertTriangle, 
  Layers, 
  FileCode2, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

// Custom node renderer for CodeShield AI
function CustomNodeComponent({ data, selected }) {
  const isVulnerable = data.risk === 'vulnerable';
  const isAffected = data.risk === 'affected';
  const isDependency = data.risk === 'dependency';

  let borderColor = 'border-slate-700';
  let badgeColor = 'bg-slate-800 text-slate-300';
  let glowStyle = '';

  if (isVulnerable) {
    borderColor = 'border-red-500 ring-2 ring-red-500/30';
    badgeColor = 'bg-red-500/20 text-red-300 border border-red-500/40';
    glowStyle = 'shadow-lg shadow-red-500/20';
  } else if (isAffected) {
    borderColor = 'border-amber-500 ring-1 ring-amber-500/20';
    badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    glowStyle = 'shadow-md shadow-amber-500/10';
  } else if (isDependency) {
    borderColor = 'border-blue-500/50';
    badgeColor = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
  }

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-slate-900 border ${borderColor} ${glowStyle} text-left min-w-[220px] transition-all duration-150 ${
        selected ? 'ring-2 ring-cyan-400' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-cyan-400" />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
          {data.type || 'Component'}
        </span>
        {isVulnerable && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>

      <div className="font-bold text-white text-xs truncate max-w-[200px]">
        {data.label}
      </div>

      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-1 truncate max-w-[200px]">
        <FileCode2 className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="truncate">{data.file}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-cyan-400" />
    </div>
  );
}

const nodeTypes = {
  customNode: CustomNodeComponent
};

export default function ImpactGraph({ graphData, onSelectNode, selectedNodeId }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const initialNodes = graphData?.nodes || [];
  const initialEdges = (graphData?.edges || []).map(edge => ({
    ...edge,
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.style?.stroke || '#64748b' }
  }));

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    if (onSelectNode) {
      onSelectNode(node);
    }
  }, [onSelectNode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[650px] overflow-hidden shadow-2xl relative">
      {/* Graph Toolbar & Legend */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Graphify Code Impact Graph</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {initialNodes.length} nodes · {initialEdges.length} connections
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow shadow-red-500/50" />
            <span className="text-slate-300 text-[11px]">Vulnerable Sink</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow shadow-amber-500/50" />
            <span className="text-slate-300 text-[11px]">Affected Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300 text-[11px]">Safe / Dependency</span>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden fill-slate-300" />
        </ReactFlow>

        {/* Interactive Node Inspection Popover */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-80 bg-slate-950/95 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-2xl z-20 text-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Component Details
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Component</span>
                <p className="font-mono text-cyan-300 font-semibold">{selectedNode.data?.label}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Source File</span>
                <p className="font-mono text-slate-300 break-all">{selectedNode.data?.file}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Impact Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {selectedNode.data?.risk === 'vulnerable' ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                      Confirmed Vulnerable Sink
                    </span>
                  ) : selectedNode.data?.risk === 'affected' ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Potential Caller / In Impact Path
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Downstream Dependency
                    </span>
                  )}
                </div>
              </div>

              {selectedNode.data?.description && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Structural Role</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800">
                    {selectedNode.data.description}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 italic pt-1">
                Note: Relationships reflect Graphify AST caller/import chains. A connection represents an impact path, not proof of independent exploitability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
