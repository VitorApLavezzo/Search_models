import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button,
    Grid,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InputSection from './components/InputSection/InputSection';
import Graph from './components/Graph/Graph';
import SearchResults from './components/SearchResults/SearchResults';

const MainContainer = styled('div')({
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column'
});

const ContentContainer = styled(Container)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    gap: theme.spacing(3),
    maxWidth: '100%!important'
}));

const SidePanel = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: 280,
    height: 'fit-content',
    position: 'sticky',
    top: theme.spacing(3)
}));

const MainPanel = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${theme.spacing(12)})`
}));

const ResultsPanel = styled(Paper)(({ theme }) => ({
    width: 320,
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(12)})`,
    position: 'sticky',
    top: theme.spacing(3),
    overflowY: 'auto'
}));

function App() {
    const [graph, setGraph] = useState({ nodes: {}, nodeCounter: 0 });
    const [selectionMode, setSelectionMode] = useState(null);
    const [startNode, setStartNode] = useState(null);
    const [goalNodes, setGoalNodes] = useState(new Set());
    const [selectedSourceNode, setSelectedSourceNode] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleAddEdge = (nodeValue, neighborValue, cost) => {
        setGraph(prev => {
            const newGraph = { ...prev };
            let sourceNodeId;

            // Se um nó está selecionado, use-o
            if (selectedSourceNode) {
                sourceNodeId = selectedSourceNode;
            } else {
                // Sempre criar um novo nó fonte se não houver seleção
                sourceNodeId = `node_${newGraph.nodeCounter++}`;
                newGraph.nodes[sourceNodeId] = {
                    id: sourceNodeId,
                    value: nodeValue,
                    neighbors: {}
                };
            }

            // Sempre criar um novo nó destino
            const targetNodeId = `node_${newGraph.nodeCounter++}`;
            newGraph.nodes[targetNodeId] = {
                id: targetNodeId,
                value: neighborValue,
                neighbors: {}
            };

            // Adicionar conexão
            newGraph.nodes[sourceNodeId].neighbors[targetNodeId] = parseFloat(cost);

            return newGraph;
        });
    };

    const handleToggleSelection = (mode) => {
        setSelectionMode(prev => prev === mode ? null : mode);
        if (mode !== 'source') {
            setSelectedSourceNode(null);
        }
    };

    const handleNodeClick = (nodeId) => {
        if (!selectionMode) return;

        switch (selectionMode) {
            case 'source':
                setSelectedSourceNode(prev => prev === nodeId ? null : nodeId);
                break;
            case 'start':
                setStartNode(prev => prev === nodeId ? null : nodeId);
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
                break;
        }
    };

    const handleSearch = async () => {
        if (!startNode || goalNodes.size === 0) {
            alert('Selecione um nó inicial e pelo menos um nó objetivo');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch('http://localhost:3001/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    graph: graph.nodes,
                    startNode,
                    goalNodes: Array.from(goalNodes)
                }),
            });

            if (!response.ok) {
                throw new Error('Erro na busca');
            }

            const data = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao realizar a busca');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        setGraph({ nodes: {}, nodeCounter: 0 });
        setStartNode(null);
        setGoalNodes(new Set());
        setSelectedSourceNode(null);
        setSearchResults(null);
        setSelectionMode(null);
    };

    return (
        <MainContainer>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        Busca de Custo Uniforme
                    </Typography>
                </Toolbar>
            </AppBar>

            <ContentContainer>
                {/* Painel de Controles */}
                <SidePanel elevation={1}>
                    <Typography variant="h6" gutterBottom>
                        Controles
                    </Typography>
                    
                    <Button
                        variant="contained"
                        onClick={() => handleToggleSelection('start')}
                        color={selectionMode === 'start' ? 'primary' : 'inherit'}
                        fullWidth
                    >
                        Selecionar Nó Inicial
                    </Button>
                    
                    <Button
                        variant="contained"
                        onClick={() => handleToggleSelection('goal')}
                        color={selectionMode === 'goal' ? 'primary' : 'inherit'}
                        fullWidth
                    >
                        Selecionar Nós Objetivo
                    </Button>

                    <Divider />
                    
                    <InputSection 
                        onAddEdge={handleAddEdge}
                        onToggleSelection={handleToggleSelection}
                        selectionMode={selectionMode}
                        selectedNode={selectedSourceNode ? graph.nodes[selectedSourceNode]?.value : null}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={isSearching || !startNode || goalNodes.size === 0}
                            color="success"
                            startIcon={<PlayArrowIcon />}
                            fullWidth
                        >
                            Buscar
                        </Button>
                        <IconButton
                            onClick={handleClear}
                            color="error"
                            sx={{ border: 1, borderColor: 'error.main' }}
                        >
                            <RestartAltIcon />
                        </IconButton>
                    </Box>
                </SidePanel>

                {/* Área do Grafo */}
                <MainPanel elevation={1}>
                    <Typography variant="h6" gutterBottom>
                        Visualização do Grafo
                    </Typography>
                    <Box sx={{ flex: 1, position: 'relative' }}>
                        <Graph
                            graph={graph}
                            onNodeClick={handleNodeClick}
                            selectionMode={selectionMode}
                            startNode={startNode}
                            goalNodes={goalNodes}
                            selectedSourceNode={selectedSourceNode}
                        />
                    </Box>
                </MainPanel>

                {/* Painel de Resultados */}
                {searchResults && (
                    <ResultsPanel elevation={1}>
                        <SearchResults 
                            results={searchResults} 
                            graph={graph.nodes}
                        />
                    </ResultsPanel>
                )}
            </ContentContainer>
        </MainContainer>
    );
}

export default App; 