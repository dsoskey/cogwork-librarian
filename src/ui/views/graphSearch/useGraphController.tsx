import {
    type CardNode,
    DEFAULT_LINK_VALUE, DEFAULT_NO_MATCH_ID,
    type GraphLink,
    type GraphNode, relatedNodeIds,
    type SearchNode, serializeGraph
} from './types'
import React, { createContext, useEffect, useRef, useState } from 'react'
import * as d3 from "d3";
import {useHoverCard} from "../../hooks/useHoverCard";
import { Setter } from '../../../types'

export const graphTheme = {
    node: {
        search: {
            fillSelected: '#faf',
            fill: '#FF01DC',
            strokeSelected: '#FF01DC',
            stroke: '#faf',
        },
        card: {
            strokeSelected: '#fef',
            stroke: 'transparent',
        }
    },
    link: {
        strokeActive: '#dad',
        stroke: 'var(--darkest-color)',
    },
    opacity: {
        high: 1,
        mid: .6,
        low: .3,
    },
    background: "#ffffff22"
}

const FILL_COLORS = [
    graphTheme.node.search.fill, // search
    '#f5f5f5',
    '#30e7ff',
    '#bd7dfc',
    '#ff7b7d',
    '#32cd32',
    '#ffbc1c',
    '#bbb',
]


const fillColor = d3.scaleOrdinal(
    ['s', 'w', 'u', 'b', 'r', 'g', 'multi', 'colorless'],
    FILL_COLORS
);

const STROKE_COLORS = [
    graphTheme.node.search.fill, // search
    '#b9b790',
    '#12555e',
    '#3e2952',
    '#56292a',
    '#155615',
    '#6c500c',
    '#313131',
]


const strokeColor = d3.scaleOrdinal(
    ['s', 'w', 'u', 'b', 'r', 'g', 'multi', 'colorless'],
    STROKE_COLORS
);


interface GraphControllerInput {
    initialLinks: GraphLink[]
    initialNodes: GraphNode[]
    maxNodes?: number;
    simulationAlpha?: number
}

export interface GraphController {
    addNode: (graphNode: GraphNode) => void;
    addNodes: (graphNodes: GraphNode[]) => void;
    removeNode: (nodeId: string) => void;
    toggleLink: (sourceId: string, targetId: string) => void;
    setGraphState: (nextState: { links: GraphLink[], nodes: GraphNode[] }) => void;
    selectedNode: GraphNode | undefined;
    setSelectedNode: Setter<GraphNode | undefined>;
    removeSelection: () => void;
    links: React.RefObject<GraphLink[]>;
    linkRef: React.RefObject<LinkSelection>;
    linkRender: (selection: LinkSelection) => LinkSelection;
    nodes: React.RefObject<GraphNode[]>;
    nodeRef: React.RefObject<NodeSelection>;
    nodeRender: (selection: NodeSelection) => NodeSelection;
    simulationRef: React.RefObject<d3.Simulation<any, any>>;
    hoverId: string;
    hoverName: string;
    hoverType: string;
    hoverStyle: React.CSSProperties;
    graphError: string;
    setGraphError: Setter<string>;
    initGraph: (svg: d3.Selection<SVGSVGElement, any, any, any>) => void;
}

export const GraphControllerContext = createContext<GraphController>({} as any)
const USE_ZOOM = true;
export function useGraphController({
    initialLinks, initialNodes,
    simulationAlpha = .1,
    maxNodes = 2500,
}: GraphControllerInput): GraphController {
    const [graphError, setGraphError] = useState('')
    const links = useRef<GraphLink[]>(initialLinks);
    const nodes = useRef<GraphNode[]>(initialNodes);
    const simulationRef = useRef<d3.Simulation<any, any>>();
    const linkRef = useRef<LinkSelection>();
    const nodeRef = useRef<NodeSelection>();
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, any>>()
    const handleGraphUpdate = () => {
        nodeRef.current = nodeRender(nodeRef.current.data(nodes.current));
        linkRef.current = linkRender(linkRef.current.data(links.current));

        simulationRef.current
            .nodes(nodes.current)
            .force("link", d3.forceLink(links.current)
                .id(d => d.id)
            )
            .alphaTarget(simulationAlpha)
            .restart()

        setSelectedNode(prev => prev ? {...prev} : undefined)
        try {
            localStorage.setItem('graph-search.state', serializeGraph({ nodes: nodes.current, links: links.current }))
        } catch (e) {
            console.error(e);
            setGraphError('Could not save graph. If you refresh you will lose graph data.')
        }
    }

    const [selectedNode, setSelectedNode] = useState<GraphNode | undefined>();
    const removeSelection = () => {
        setSelectedNode(undefined);
        nodeRef.current
            .attr('fill-opacity', 1)
            .attr('fill', d => fillColor(d.group))
            .attr('stroke', d => graphTheme.node[d.type].stroke);
        linkRef.current
            .attr('stroke-opacity', graphTheme.opacity.mid)
            .attr('stroke', graphTheme.link.stroke);
    }

    const [hoverId, setHoverId] = useState<string>("");
    const [hoverName, setHoverName] = useState<string>("");
    const [hoverType, setHoverType] = useState<string>("");
    const {handleHover, hoverStyle} = useHoverCard()



    const _addCardNode = (cardNode: CardNode) => {
        let matches = 0;
        for (const node of nodes.current) {
            if (node.type === 'search' && (node as SearchNode).filterFunc(cardNode.card)) {
                const searchNode = node as SearchNode;
                matches++;
                searchNode.size++;
                searchNode.totalSize++;
                const link: GraphLink = {
                    source: searchNode.id,
                    target: cardNode.id,
                    value: DEFAULT_LINK_VALUE,
                };
                links.current.push(link);
            }
        }
        if (matches === 0) {
            const defaultSearch = nodes.current
                .find(node => node.type === 'search' && node.id === DEFAULT_NO_MATCH_ID) as SearchNode | undefined;
            if (defaultSearch) {
                defaultSearch.size++;
                defaultSearch.totalSize++;
                const link: GraphLink = {
                    source: defaultSearch.id,
                    target: cardNode.id,
                    value: DEFAULT_LINK_VALUE,
                };
                links.current.push(link);
            }
        }
        nodes.current.push(cardNode);
    }

    const _addSearchNode = (searchNode: SearchNode) => {
        for (const node of nodes.current) {
            if (node.type === 'card' && searchNode.filterFunc((node as CardNode).card)) {
                const link: GraphLink = {
                    source: searchNode.id,
                    target: node.id,
                    value: DEFAULT_LINK_VALUE,
                }
                links.current.push(link);
                searchNode.size++;
                searchNode.totalSize++;
            }
        }
        nodes.current.push(searchNode);
    }

    const addNode = (graphNode: GraphNode) => {
        setGraphError('');
        if (nodes.current.length >= maxNodes) {
            setGraphError(`Could not add ${graphNode.id}, node limit reached`);
            return;
        }
        if (nodes.current.find(node => node.id === graphNode.id)) return;

        switch (graphNode.type) {
            case "card": {
                _addCardNode(graphNode as CardNode);
                break;
            }
            case "search": {
                _addSearchNode(graphNode as SearchNode);
                break;
            }
        }
        handleGraphUpdate();
        setSelectedNode(graphNode);
    }

    const addNodes = (graphNodes: GraphNode[]) => {
        setGraphError('');
        for (let i = 0; i < graphNodes.length; i++){
            const graphNode = graphNodes[i]
            if (nodes.current.length >= maxNodes) {
                setGraphError(`Could not add ${graphNode.id}, node limit reached. Skipping ${graphNodes.length - i} nodes.`);
                break;
            }
            if (nodes.current.find(node => node.id === graphNode.id)) continue;

            switch (graphNode.type) {
                case "card": {
                    _addCardNode(graphNode as CardNode);
                    break;
                }
                case "search": {
                    _addSearchNode(graphNode as SearchNode);
                    break;
                }
            }
        }
        handleGraphUpdate();
    }

    const removeNode = (nodeId: string) => {
        const indexToRemove = nodes.current.findIndex(node => nodeId === node.id);
        if (indexToRemove === -1) return;

        const nodesToUpdate = relatedNodeIds(links.current, nodeId);

        links.current = links.current.filter(it =>
            (it.source?.id ?? it.source) !== selectedNode?.id &&
            (it.target?.id ?? it.target) !== selectedNode?.id
        )
        nodes.current.splice(indexToRemove, 1);
        for (const node of nodes.current) {
            if (nodesToUpdate.has(node.id) && node.type === 'search' && node.size > 1) {
                node.size--;
            }
        }

        removeSelection();
        handleGraphUpdate();
    }

    const toggleLink = (source: string, target: string) => {
        const linkIndex = links.current
            .findIndex(link =>
                (link.source?.id ?? link.source) === source && (link.target?.id ?? link.target) === target
                || (link.source?.id ?? link.source) === target && (link.target?.id ?? link.target) === source
            );

        if (linkIndex < 0) {
            const link: GraphLink = { source: source, target: target, value: 10};
            links.current.push(link)
        } else {
            links.current.splice(linkIndex, 1);
        }
        handleGraphUpdate();
    }

    const setGraphState = (nextState: { links: GraphLink[], nodes: GraphNode[] }) => {
        links.current = nextState.links;
        nodes.current = nextState.nodes;

        removeSelection();
        handleGraphUpdate();
    }

    useEffect(() => {
        nodeRef.current?.on('click', onNodeClick)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);

        if (!selectedNode) return;

        linkRef.current
            .attr("stroke", function (link) {
                return (link.source?.id ?? link.source) === selectedNode.id || (link.target?.id ?? link.target) === selectedNode.id
                    ? graphTheme.link.strokeActive
                    : graphTheme.link.stroke;
            })
            .attr('stroke-opacity', function (link) {
                return (link.source?.id ?? link.source) === selectedNode.id || (link.target?.id ?? link.target) === selectedNode.id
                    ? graphTheme.opacity.high
                    : graphTheme.opacity.low;
            })
            .style('z-index', function (link) {
                return (link.source?.id ?? link.source) === selectedNode.id || (link.target?.id ?? link.target) === selectedNode.id
                    ? 10 : 1;

            });

        if (selectedNode.type === 'search') {
            const searchNode = selectedNode as SearchNode;
            nodeRef.current
                .attr("stroke", d => {
                    if (d.id === searchNode.id) return graphTheme.node[d.type].strokeSelected;
                    return graphTheme.node[d.type].stroke;
                })
                .attr('fill', d => {
                    if (d.id === searchNode.id) return graphTheme.node.search.fillSelected;
                    return fillColor(d.group);
                })
                .attr('fill-opacity', function (node) {
                    switch (node.type) {
                        case "card":
                            const cardNode = node as CardNode;
                            return searchNode.filterFunc(cardNode.card)
                                ? graphTheme.opacity.high
                                : graphTheme.opacity.low;
                        case "search":
                            return searchNode.id === node.id
                                ? graphTheme.opacity.high
                                : graphTheme.opacity.low;

                    }
                })
        } else {
            nodeRef.current
                .attr("stroke", d => {
                    if (d.id === selectedNode.id) return fillColor(d.group);
                    return graphTheme.node[d.type].stroke;
                })
                .attr('fill', d => {
                    if (d.id === selectedNode.id) return strokeColor(d.group);
                    return fillColor(d.group);
                })
                .attr('fill-opacity', 1)
        }
    }, [selectedNode]);

    return {
        addNode, addNodes, removeNode, toggleLink, setGraphState,
        selectedNode, setSelectedNode: setSelectedNode, removeSelection,
        links, linkRef, linkRender,
        nodes, nodeRef, nodeRender,
        simulationRef, initGraph,
        hoverId, hoverName, hoverType, hoverStyle,
        graphError, setGraphError
    }

    function initGraph(svg: d3.Selection<SVGSVGElement, any, any, any>) {
        const _links = links.current;
        const _nodes = nodes.current;

        simulationRef.current = d3.forceSimulation(_nodes)
          .force("link", d3.forceLink(_links)
            .id(d => d.id)
          )
          .force("charge", d3.forceManyBody())
          .force("x", d3.forceX())
          .force("y", d3.forceY())
          .on('tick', ticked);

        if (USE_ZOOM) {
            zoomRef.current = d3.zoom()
              .scaleExtent([0.75, 4])
              // todo: restrict panning area
              // .translateExtent([[], []])
              .on("zoom", zoomed);
            svg.call(zoomRef.current).call(zoomRef.current.transform, d3.zoomIdentity);
        }

        linkRef.current = linkRender(svg.append("g")
          .attr('class', 'link')
          .attr("stroke-opacity", 0.6)
          .selectAll()
          .data(_links));

        nodeRef.current = nodeRender(svg.append("g")
          .attr("stroke-width", 1.5)
          .selectAll()
          .data(_nodes));
    }

    function nodeRender(selection: NodeSelection) {
        let result = selection
            .join("circle")
            .attr("r", d => Math.max(Math.floor(Math.log(d.size) * 3), 6))
            .style('cursor', 'pointer')
            .attr("stroke", d => {
                if (d.id === selectedNode?.id)
                    return graphTheme.node[d.type].strokeSelected;
                return graphTheme.node[d.type].stroke;
            })
            .attr("fill", d => fillColor(d.group))
            .on('click', onNodeClick)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave)

        // add toggleable title here

        if (USE_ZOOM) {
            if (result.node()) {
                const transform = d3.zoomTransform(result.node());
                result.attr("transform", transform.toString());
            }
        }

        result.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        return result;
    }

    function linkRender(selection: LinkSelection) {
        const result = selection
          .join("line")
          .attr('stroke', graphTheme.link.stroke)
          .attr('stroke-opacity', graphTheme.opacity.mid)
          .attr("stroke-width", d => Math.sqrt(d.value));

        if (USE_ZOOM) {
            if (result.node()) {
                const transform = d3.zoomTransform(result.node());
                result.attr("transform", transform.toString());
            }
        }

        return result;
    }

    function onNodeClick(event: React.MouseEvent, nodeClicked: GraphNode) {
        event.stopPropagation();
        const _selectedNode = nodes.current.find(it => it.id === selectedNode?.id);

        if (_selectedNode
            && event.shiftKey
            && _selectedNode.id !== nodeClicked.id
            && _selectedNode.type === nodeClicked.type
        ) {
            toggleLink(_selectedNode.id, nodeClicked.id);
            return;
        }


        setSelectedNode(nodeClicked);
    }

    // hover events
    function mousemove(event: React.MouseEvent, node: GraphNode) {
        setHoverId(node.card?.id ?? node.id);
        setHoverName(node.card?.name ?? node.id);
        handleHover(event);
        setHoverType(node.type)
    }

    function mouseleave() {
        setHoverId("");
        setHoverName("");
        setHoverType('');
    }

    function ticked() {
        if (!linkRef.current || !nodeRef.current) return;
        linkRef.current
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        nodeRef.current
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    }

    function zoomed({ transform }) {
        nodeRef.current?.attr("transform", transform);
        linkRef.current?.attr("transform", transform);
    }

    // drag events
    function dragstarted(event) {
        if (!event.active) {
            simulationRef.current
                .alphaTarget(simulationAlpha)
                .restart();
        }
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        const transform = d3.zoomTransform(this)
        event.subject.fx += event.dx / transform.k;
        event.subject.fy += event.dy / transform.k;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulationRef.current.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

export type NodeSelection = d3.Selection<ElementTagNameMap[string] | null, GraphNode, ElementTagNameMap[string], unknown>;
export type LinkSelection = d3.Selection<ElementTagNameMap[string] | null, GraphLink, ElementTagNameMap[string], unknown>
