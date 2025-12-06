import React, {useEffect, useRef} from "react";
import type {GraphLink, GraphNode} from "./types";
import * as d3 from "d3";
import {graphTheme, type LinkSelection, type NodeSelection} from "./useGraphController";

interface GraphViewProps {
    links: React.RefObject<GraphLink[]>;
    linkRef: React.RefObject<LinkSelection>;
    nodes: React.RefObject<GraphNode[]>;
    selectedNode?: GraphNode;
    removeNode: (nodeId: string) => void;
    removeSelection: () => void;
    nodeRef: React.RefObject<NodeSelection>;
    linkRender: (selection: LinkSelection) => LinkSelection;
    nodeRender: (selection: NodeSelection) => NodeSelection;
    simulationRef: React.RefObject<d3.Simulation<any, any>>

    width?: number
    height?: number
}

export function GraphView(
{
    links, linkRef, linkRender,
    nodes, nodeRef, nodeRender,
    simulationRef,
    selectedNode, removeNode, removeSelection,
    width = 928, height = 600
}: GraphViewProps) {
    const graphRef = useRef<SVGSVGElement>(null);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        console.log(event.key);
        switch (event.key) {
            case 'Delete':
            case "Backspace":
                if (selectedNode) {
                    removeNode(selectedNode.id);
                }
                break;
        }
    }

    useEffect(() => {
        if (linkRef.current && nodeRef.current) return;

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

        const svg = d3.select(graphRef.current);

        linkRef.current = linkRender(svg.append("g")
            .attr('class', 'link')
            .attr("stroke-opacity", 0.6)
            .selectAll()
            .data(_links));

        nodeRef.current = nodeRender(svg.append("g")
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(_nodes));

        function ticked() {
            linkRef.current
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodeRef.current
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
    }, []);

    return <svg
        className="graph-view-root"
        onKeyDown={handleKeyDown} tabIndex={-1}
        onClick={removeSelection}
        ref={graphRef}
        viewBox={`${-width / 2} ${-height * 2 / 3} ${width} ${height * 4 / 3}`}
        style={{
            maxWidth: "100%",
            aspectRatio: `auto`,
            position: "relative",
            background: graphTheme.background,
        }}
    />
}