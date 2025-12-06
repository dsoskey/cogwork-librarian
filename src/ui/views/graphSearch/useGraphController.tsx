import {
    type CardNode,
    DEFAULT_LINK_VALUE, DEFAULT_NO_MATCH_ID,
    type GraphLink,
    type GraphNode, relatedNodeIds,
    type SearchNode
} from "./types";
import React, { useEffect, useRef, useState } from 'react'
import * as d3 from "d3";
import {useHoverCard} from "../../hooks/useHoverCard";

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
        stroke: '#333',
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
    ['s', 'w', 'u', 'b', 'r', 'g', 'm', 'c'],
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
    ['s', 'w', 'u', 'b', 'r', 'g', 'm', 'c'],
    STROKE_COLORS
);


interface GraphControllerInput {
    initialLinks: GraphLink[]
    initialNodes: GraphNode[]
    simulationAlpha?: number
}



export function useGraphController({
    initialLinks, initialNodes,
    simulationAlpha = .1,
}: GraphControllerInput) {
    const links = useRef<GraphLink[]>(initialLinks);
    const nodes = useRef<GraphNode[]>(initialNodes);
    const simulationRef = useRef<d3.Simulation<any, any>>();
    const linkRef = useRef<LinkSelection>();
    const nodeRef = useRef<NodeSelection>();

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
    }

    const addNodes = (graphNodes: GraphNode[]) => {
        for (const graphNode of graphNodes) {
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
            if (nodesToUpdate.has(node.id) && node.type === 'search') {
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
        simulationRef,
        hoverId, hoverName, hoverType, hoverStyle,
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

        result.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        return result;
    }

    function linkRender(selection: LinkSelection) {
        return selection
            .join("line")
            .attr('stroke', graphTheme.link.stroke)
            .attr('stroke-opacity', graphTheme.opacity.mid)
            .attr("stroke-width", d => Math.sqrt(d.value))
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
        event.subject.fx = event.x;
        event.subject.fy = event.y;
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
