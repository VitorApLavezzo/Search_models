import React, { useState } from 'react';
import { 
    Paper, 
    Typography, 
    Box, 
    List, 
    ListItem, 
    ListItemText,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Divider,
    Alert
} from '@mui/material';

const SearchResults = ({ results, graph }) => {
    const [activeStep, setActiveStep] = useState(0);

    if (!results || !results.length) return null;

    const result = results[0]; // Agora temos apenas um resultado (o melhor caminho)

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Resultado da Busca
            </Typography>

            {/* Mostrar o melhor caminho encontrado */}
            <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Melhor Caminho Encontrado:
                </Typography>
                <Typography>
                    {result.path.map(node => node.value).join(' → ')}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Custo Total: {result.cost}
                </Typography>
            </Alert>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
                Passo a passo da busca:
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
                {result.steps.map((step, index) => (
                    <Step key={index}>
                        <StepLabel>
                            <Typography variant="subtitle2">
                                Explorando nó: {graph[step.current_node]?.value}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography>
                                    <strong>Custo atual:</strong> {step.current_cost}
                                </Typography>
                                <Typography>
                                    <strong>Caminho atual:</strong> {step.current_path.map(id => graph[id]?.value).join(' → ')}
                                </Typography>
                                <Typography>
                                    <strong>Fronteira:</strong> {step.frontier.map(([cost, path]) => (
                                        `(${path.map(id => graph[id]?.value).join('->')}: ${cost})`
                                    )).join(', ')}
                                </Typography>
                                <Typography>
                                    <strong>Nós explorados:</strong> {step.explored.map(id => graph[id]?.value).join(', ')}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    {index === result.steps.length - 1 ? 'Finalizar' : 'Próximo'}
                                </Button>
                                <Button
                                    disabled={index === 0}
                                    onClick={handleBack}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    Voltar
                                </Button>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === result.steps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                    <Typography>Busca finalizada!</Typography>
                    <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                        Ver passos novamente
                    </Button>
                </Paper>
            )}
        </Paper>
    );
};

export default SearchResults; 