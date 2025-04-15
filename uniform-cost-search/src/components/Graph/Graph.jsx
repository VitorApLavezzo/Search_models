import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const Graph = ({ graph, onNodeClick, selectionMode, startNode, goalNodes, selectedSourceNode }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!graph.nodes || Object.keys(graph.nodes).length === 0) return;

        const container = svgRef.current;
        container.innerHTML = '';

        const width = container.clientWidth;
        const height = 600;
        const margin = { top: 40, right: 90, bottom: 50, left: 90 };

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        // Adicionar zoom e pan
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Definir sombra
        const defs = svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'shadow')
            .attr('x', '-40%')
            .attr('y', '-40%')
            .attr('width', '180%')
            .attr('height', '180%');

        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3);

        filter.append('feOffset')
            .attr('dx', 2)
            .attr('dy', 2);

        filter.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', 0.2);

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Criar layout da árvore
        const treeLayout = d3.tree()
            .nodeSize([80, 120])  // [vertical, horizontal]
            .separation((a, b) => a.parent === b.parent ? 1.2 : 2);

        // Converter dados para hierarquia D3
        const root = d3.hierarchy(convertToTreeData(graph.nodes));
        treeLayout(root);

        // Desenhar links com curvas suaves
        const links = g.selectAll('.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        // Adicionar custos nas arestas
        const costs = g.selectAll('.cost-label')
            .data(root.links())
            .join('text')
            .attr('class', 'cost-label')
            .attr('x', d => (d.source.y + d.target.y) / 2)
            .attr('y', d => (d.source.x + d.target.x) / 2 - 10)
            .attr('text-anchor', 'middle')
            .text(d => d.target.data.cost);

        // Criar grupos para os nós
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .join('g')
            .attr('class', d => {
                const classes = ['node'];
                if (d.data.id === startNode) classes.push('start');
                if (goalNodes.has(d.data.id)) classes.push('goal');
                if (d.data.id === selectedSourceNode) classes.push('selected');
                if (selectionMode) classes.push('selectable');
                return classes.join(' ');
            })
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => onNodeClick(d.data.id));

        // Adicionar círculos aos nós
        nodes.append('circle')
            .attr('r', 25)
            .style('filter', 'url(#shadow)');

        // Adicionar texto aos nós
        nodes.append('text')
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.value);

        // Centralizar o grafo
        const bounds = root.descendants().reduce(
            (acc, node) => ({
                minX: Math.min(acc.minX, node.x),
                maxX: Math.max(acc.maxX, node.x),
                minY: Math.min(acc.minY, node.y),
                maxY: Math.max(acc.maxY, node.y),
            }),
            { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
        );

        const centerX = (width - margin.left - margin.right) / 2;
        const centerY = (height - margin.top - margin.bottom) / 2;
        const scale = 0.8;

        const initialTransform = d3.zoomIdentity
            .translate(
                centerX - (bounds.minY + bounds.maxY) / 2 * scale,
                centerY - (bounds.minX + bounds.maxX) / 2 * scale
            )
            .scale(scale);

        svg.call(zoom.transform, initialTransform);

    }, [graph, onNodeClick, selectionMode, startNode, goalNodes, selectedSourceNode]);

    // Função auxiliar para converter dados do grafo para formato de árvore
    const convertToTreeData = (nodes) => {
        const findRoot = () => {
            const allNodes = new Set(Object.keys(nodes));
            Object.values(nodes).forEach(node => {
                Object.keys(node.neighbors).forEach(neighborId => {
                    allNodes.delete(neighborId);
                });
            });
            return Array.from(allNodes)[0] || Object.keys(nodes)[0];
        };

        const buildTree = (nodeId, visited = new Set()) => {
            if (visited.has(nodeId)) return null;
            visited.add(nodeId);

            const node = nodes[nodeId];
            const children = Object.entries(node.neighbors)
                .map(([id, cost]) => {
                    const child = buildTree(id, new Set(visited));
                    if (child) child.cost = cost;
                    return child;
                })
                .filter(Boolean);

            return {
                id: nodeId,
                value: node.value,
                children: children.length > 0 ? children : undefined
            };
        };

        return buildTree(findRoot());
    };

    return (
        <Box
            ref={svgRef}
            sx={{
                width: '100%',
                height: 600,
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                '& .link': {
                    fill: 'none',
                    stroke: '#ccc',
                    strokeWidth: 2,
                    transition: 'all 0.3s ease',
                },
                '& .node circle': {
                    fill: '#fff',
                    stroke: '#1976d2',
                    strokeWidth: 2,
                    transition: 'all 0.3s ease',
                },
                '& .node.start circle': {
                    fill: '#1976d2',
                    stroke: '#1976d2',
                },
                '& .node.goal circle': {
                    fill: '#4caf50',
                    stroke: '#4caf50',
                },
                '& .node.selected circle': {
                    fill: '#ff9800',
                    stroke: '#ff9800',
                },
                '& .node.selectable:hover circle': {
                    strokeWidth: 3,
                    transform: 'scale(1.1)',
                },
                '& .node text': {
                    fontSize: '14px',
                    fontWeight: 500,
                    fill: '#333',
                    userSelect: 'none',
                },
                '& .node.start text, & .node.goal text, & .node.selected text': {
                    fill: '#fff',
                },
                '& .cost-label': {
                    fontSize: '12px',
                    fill: '#666',
                    fontWeight: 500,
                    pointerEvents: 'none',
                    backgroundColor: '#fff',
                    padding: '2px 4px',
                },
            }}
        />
    );
};

export default Graph; 