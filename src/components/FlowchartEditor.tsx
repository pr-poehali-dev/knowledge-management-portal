import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end';
  label: string;
  x: number;
  y: number;
}

interface FlowchartEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const FlowchartEditor = () => {
  const [nodes, setNodes] = useState<FlowchartNode[]>([]);
  const [edges, setEdges] = useState<FlowchartEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState<FlowchartNode['type']>('process');

  const addNode = useCallback(() => {
    if (!nodeLabel.trim()) {
      toast.error('Введите название блока');
      return;
    }

    const newNode: FlowchartNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      label: nodeLabel,
      x: 50 + (nodes.length % 4) * 200,
      y: 50 + Math.floor(nodes.length / 4) * 150,
    };

    setNodes([...nodes, newNode]);
    setNodeLabel('');
    toast.success('Блок добавлен');
  }, [nodeLabel, nodeType, nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
    toast.success('Блок удалён');
  }, [nodes, edges, selectedNode]);

  const connectNodes = useCallback((fromId: string, toId: string) => {
    const newEdge: FlowchartEdge = {
      id: `edge-${Date.now()}`,
      from: fromId,
      to: toId,
    };
    setEdges([...edges, newEdge]);
    toast.success('Блоки соединены');
  }, [edges]);

  const getNodeStyle = (type: FlowchartNode['type']) => {
    switch (type) {
      case 'start':
        return 'bg-green-100 border-green-500 rounded-full';
      case 'end':
        return 'bg-red-100 border-red-500 rounded-full';
      case 'decision':
        return 'bg-yellow-100 border-yellow-500 transform rotate-45';
      case 'process':
      default:
        return 'bg-blue-100 border-blue-500 rounded-lg';
    }
  };

  const getNodeIcon = (type: FlowchartNode['type']) => {
    switch (type) {
      case 'start':
        return 'Play';
      case 'end':
        return 'Square';
      case 'decision':
        return 'GitBranch';
      case 'process':
      default:
        return 'Box';
    }
  };

  const saveFlowchart = () => {
    const flowchartData = { nodes, edges };
    console.log('Saving flowchart:', flowchartData);
    toast.success('Блок-схема сохранена');
  };

  return (
    <div className="flex gap-4 h-[calc(90vh-120px)]">
      <div className="w-80 space-y-4 overflow-y-auto">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Добавить блок</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="node-type">Тип блока</Label>
              <Select value={nodeType} onValueChange={(value) => setNodeType(value as FlowchartNode['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Начало</SelectItem>
                  <SelectItem value="process">Процесс</SelectItem>
                  <SelectItem value="decision">Решение</SelectItem>
                  <SelectItem value="end">Конец</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="node-label">Название</Label>
              <Input
                id="node-label"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="Введите название"
                onKeyDown={(e) => e.key === 'Enter' && addNode()}
              />
            </div>
            <Button onClick={addNode} className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить блок
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Блоки ({nodes.length})</h3>
          <div className="space-y-2">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                  selectedNode === node.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon name={getNodeIcon(node.type)} size={16} />
                  <span className="text-sm truncate">{node.label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-2">
          <Button onClick={saveFlowchart} className="flex-1">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              toast.success('Схема очищена');
            }}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>

      <Card className="flex-1 relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 p-8">
          {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="GitBranch" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Добавьте первый блок для начала работы</p>
              </div>
            </div>
          ) : (
            <svg className="w-full h-full">
              {edges.map((edge) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                return (
                  <g key={edge.id}>
                    <line
                      x1={fromNode.x + 80}
                      y1={fromNode.y + 40}
                      x2={toNode.x + 80}
                      y2={toNode.y + 40}
                      stroke="#0EA5E9"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#0EA5E9" />
                </marker>
              </defs>
            </svg>
          )}

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-40 h-20 border-2 flex items-center justify-center text-sm font-medium cursor-move transition-all ${
                getNodeStyle(node.type)
              } ${selectedNode === node.id ? 'ring-2 ring-primary' : ''}`}
              style={{
                left: node.x,
                top: node.y,
              }}
              onClick={() => setSelectedNode(node.id)}
            >
              <div className={node.type === 'decision' ? 'transform -rotate-45' : ''}>
                {node.label}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FlowchartEditor;
