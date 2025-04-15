import React from 'react';
import { TextField, Button, Box } from '@mui/material';

const InputSection = ({ 
    onAddEdge, 
    onToggleSelection, 
    selectionMode,
    selectedNode 
}) => {
    const [nodeValue, setNodeValue] = React.useState('');
    const [neighborValue, setNeighborValue] = React.useState('');
    const [cost, setCost] = React.useState('');

    React.useEffect(() => {
        if (selectedNode) {
            setNodeValue(selectedNode);
        }
    }, [selectedNode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddEdge(nodeValue, neighborValue, parseFloat(cost));
        setNodeValue(selectedNode || '');
        setNeighborValue('');
        setCost('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
            <div>
                <TextField
                    fullWidth
                    label="Nó"
                    value={nodeValue}
                    onChange={(e) => setNodeValue(e.target.value)}
                    placeholder="Ex: A"
                    disabled={!!selectedNode}
                />
                <Button
                    variant="outlined"
                    onClick={() => onToggleSelection('source')}
                    color={selectionMode === 'source' ? 'primary' : 'inherit'}
                    sx={{ mt: 1 }}
                >
                    Selecionar na árvore
                </Button>
            </div>

            <div>
                <TextField
                    fullWidth
                    label="Vizinho"
                    value={neighborValue}
                    onChange={(e) => setNeighborValue(e.target.value)}
                    placeholder="Ex: B"
                />
                <Button
                    variant="outlined"
                    onClick={() => onToggleSelection('target')}
                    color={selectionMode === 'target' ? 'primary' : 'inherit'}
                    sx={{ mt: 1 }}
                >
                    Selecionar na árvore
                </Button>
            </div>

            <TextField
                label="Custo"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Ex: 1"
            />

            <Button
                variant="contained"
                type="submit"
                fullWidth
            >
                Adicionar Conexão
            </Button>
        </Box>
    );
};

export default InputSection; 