import { useState, useCallback } from 'react';

export const useGraph = () => {
    const [graph, setGraph] = useState({ nodes: {}, nodeCounter: 0 });
    const [startNode, setStartNode] = useState(null);
    const [goalNodes, setGoalNodes] = useState(new Set());
    const [selectionMode, setSelectionMode] = useState(null);
    const [selectedSourceNode, setSelectedSourceNode] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const saveState = useCallback(() => {
        const state = {
            nodes: JSON.parse(JSON.stringify(graph.nodes)),
            nodeCounter: graph.nodeCounter,
            startNode,
            goalNodes: Array.from(goalNodes)
        };

        setHistory(prev => {
            const newHistory = [...prev.slice(0, historyIndex + 1), state];
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
        });
    }, [graph, startNode, goalNodes, historyIndex]);

    const handleNodeClick = useCallback((nodeId) => {
        if (!selectionMode) return;

        switch (selectionMode) {
            case 'source':
                setSelectedSourceNode(nodeId);
                break;
            case 'target':
                // Handled by InputSection
                break;
            case 'start':
                setStartNode(nodeId);
                saveState();
                break;
            case 'goal':
                setGoalNodes(prev => {
                    const newGoals = new Set(prev);
                    if (newGoals.has(nodeId)) {
                        newGoals.delete(nodeId);
                    } else {
                        newGoals.add(nodeId);
                    }
                    return newGoals;
                });
                saveState();
                break;
            default:
                break;
        }
    }, [selectionMode, saveState]);

    const handleAddEdge = useCallback((nodeValue, neighborValue, cost) => {
        if (!nodeValue || !neighborValue || isNaN(cost)) {
            alert('Por favor, preencha todos os campos corretamente');
            return;
        }

        setGraph(prev => {
            const newGraph = { ...prev };
            let sourceNodeId;

            if (selectedSourceNode && newGraph.nodes[selectedSourceNode]?.value === nodeValue) {
                sourceNodeId = selectedSourceNode;
            } else {
                const existingSourceNodes = Object.entries(newGraph.nodes)
                    .find(([_, node]) => node.value === nodeValue);

                if (existingSourceNodes) {
                    sourceNodeId = existingSourceNodes[0];
                } else {
                    sourceNodeId = `node_${newGraph.nodeCounter++}`;
                    newGraph.nodes[sourceNodeId] = {
                        id: sourceNodeId,
                        value: nodeValue,
                        neighbors: {}
                    };
                }
            }

            const targetNodeId = `node_${newGraph.nodeCounter++}`;
            newGraph.nodes[targetNodeId] = {
                id: targetNodeId,
                value: neighborValue,
                neighbors: {}
            };

            newGraph.nodes[sourceNodeId].neighbors[targetNodeId] = cost;
            return newGraph;
        });

        setSelectedSourceNode(null);
        saveState();
    }, [selectedSourceNode, saveState]);

    const toggleNodeSelection = useCallback((mode) => {
        setSelectionMode(prev => prev === mode ? null : mode);
        if (mode !== 'source') {
            setSelectedSourceNode(null);
        }
    }, []);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const state = history[historyIndex - 1];
            setGraph(prev => ({
                ...prev,
                nodes: JSON.parse(JSON.stringify(state.nodes)),
                nodeCounter: state.nodeCounter
            }));
            setStartNode(state.startNode);
            setGoalNodes(new Set(state.goalNodes));
            setHistoryIndex(historyIndex - 1);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const state = history[historyIndex + 1];
            setGraph(prev => ({
                ...prev,
                nodes: JSON.parse(JSON.stringify(state.nodes)),
                nodeCounter: state.nodeCounter
            }));
            setStartNode(state.startNode);
            setGoalNodes(new Set(state.goalNodes));
            setHistoryIndex(historyIndex + 1);
        }
    }, [history, historyIndex]);

    const saveTree = useCallback(() => {
        const treeName = prompt("Digite um nome para salvar esta árvore:");
        if (treeName) {
            const savedTree = {
                nodes: graph.nodes,
                nodeCounter: graph.nodeCounter,
                startNode,
                goalNodes: Array.from(goalNodes)
            };
            localStorage.setItem(`tree_${treeName}`, JSON.stringify(savedTree));
        }
    }, [graph, startNode, goalNodes]);

    const loadTree = useCallback(() => {
        const trees = Object.keys(localStorage)
            .filter(key => key.startsWith('tree_'))
            .map(key => key.replace('tree_', ''));

        if (trees.length === 0) {
            alert('Nenhuma árvore salva encontrada');
            return;
        }

        const treeName = prompt(`Árvores disponíveis:\n${trees.join('\n')}\n\nDigite o nome da árvore para carregar:`);
        if (treeName) {
            const savedTree = localStorage.getItem(`tree_${treeName}`);
            if (savedTree) {
                const treeData = JSON.parse(savedTree);
                setGraph(prev => ({
                    ...prev,
                    nodes: treeData.nodes,
                    nodeCounter: treeData.nodeCounter
                }));
                setStartNode(treeData.startNode);
                setGoalNodes(new Set(treeData.goalNodes));
                saveState();
            }
        }
    }, [saveState]);

    const exportTree = useCallback(() => {
        const treeData = {
            nodes: graph.nodes,
            nodeCounter: graph.nodeCounter,
            startNode,
            goalNodes: Array.from(goalNodes)
        };

        const dataStr = "data:text/json;charset=utf-8," + 
            encodeURIComponent(JSON.stringify(treeData));

        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tree.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }, [graph, startNode, goalNodes]);

    const importTree = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = event => {
                const treeData = JSON.parse(event.target.result);
                setGraph(prev => ({
                    ...prev,
                    nodes: treeData.nodes,
                    nodeCounter: treeData.nodeCounter
                }));
                setStartNode(treeData.startNode);
                setGoalNodes(new Set(treeData.goalNodes));
                saveState();
            };

            reader.readAsText(file);
        };

        input.click();
    }, [saveState]);

    return {
        graph,
        startNode,
        goalNodes,
        selectionMode,
        history,
        historyIndex,
        handleNodeClick,
        handleAddEdge,
        toggleNodeSelection,
        undo,
        redo,
        saveTree,
        loadTree,
        exportTree,
        importTree
    };
}; 