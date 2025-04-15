import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import {
    Undo,
    Redo,
    Save,
    FolderOpen,
    FileDownload,
    FileUpload
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ToolbarContainer = styled(Box)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    background: 'white',
    padding: 10,
    borderRadius: 10,
    boxShadow: '0 2px 10px var(--shadow-color)',
    display: 'flex',
    gap: 10,
    zIndex: 1000,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: '0 5px',
}));

const Toolbar = ({
    onUndo,
    onRedo,
    onSave,
    onLoad,
    onExport,
    onImport,
    canUndo,
    canRedo
}) => {
    return (
        <ToolbarContainer>
            <Tooltip title="Desfazer">
                <span>
                    <IconButton onClick={onUndo} disabled={!canUndo}>
                        <Undo />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Refazer">
                <span>
                    <IconButton onClick={onRedo} disabled={!canRedo}>
                        <Redo />
                    </IconButton>
                </span>
            </Tooltip>
            
            <StyledDivider orientation="vertical" flexItem />
            
            <Tooltip title="Salvar Árvore">
                <IconButton onClick={onSave}>
                    <Save />
                </IconButton>
            </Tooltip>
            <Tooltip title="Carregar Árvore">
                <IconButton onClick={onLoad}>
                    <FolderOpen />
                </IconButton>
            </Tooltip>
            
            <StyledDivider orientation="vertical" flexItem />
            
            <Tooltip title="Exportar">
                <IconButton onClick={onExport}>
                    <FileDownload />
                </IconButton>
            </Tooltip>
            <Tooltip title="Importar">
                <IconButton onClick={onImport}>
                    <FileUpload />
                </IconButton>
            </Tooltip>
        </ToolbarContainer>
    );
};

export default Toolbar; 