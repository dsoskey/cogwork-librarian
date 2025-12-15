import React, {useEffect, useRef} from "react";
import type {GraphNode} from "./types";
import * as d3 from "d3";
import {graphTheme, type LinkSelection, type NodeSelection} from "./useGraphController";
import { TaskStatus } from '../../../types'

interface GraphViewProps {
    linkRef: React.RefObject<LinkSelection>;
    selectedNode?: GraphNode;
    removeNode: (nodeId: string) => void;
    removeSelection: () => void;
    nodeRef: React.RefObject<NodeSelection>;
    simulationRef: React.RefObject<d3.Simulation<any, any>>
    graphStatus: TaskStatus;
    width?: number
    height?: number
    initGraph: (svg: d3.Selection<SVGSVGElement, any, any, any>) => void;
}

export function GraphView(
{
    linkRef, nodeRef, initGraph,
    selectedNode, removeNode, removeSelection,
    graphStatus,
    width = 900, height = 900
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

        const svg = d3.select(graphRef.current);

        initGraph(svg);
    }, []);

    return <svg
      className="graph-view-root"
      onKeyDown={handleKeyDown} tabIndex={-1}
      onClick={removeSelection}
      ref={graphRef}
      viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      style={{
          maxWidth: "100%",
          aspectRatio: `auto`,
          position: "relative",
          background: graphTheme.background,
      }}
    >

        {graphStatus === 'loading' &&
            <g className="loading-indicator rotating d1s">
                <path
                  d="M 95.887823,0.06806513 A 96,96 0 1 1 -0.11217685,-95.931935 96,96 0 0 1 95.887823,0.06806513"
                  opacity="0.2"
                  id="path1" />
                <path
                  d="m 7.8878232,-95.931935 v 32 a 8,8 0 0 1 -16,0 v -32 a 8,8 0 0 1 16,0 M 95.887823,-7.9319349 h -32 a 8,8 0 0 0 0,16 h 32 a 8,8 0 0 0 0,-16 m -45.09,47.5999999 a 8,8 0 0 0 -11.31,11.31 l 22.62,22.63 a 8.0044488,8.0044488 0 0 0 11.32,-11.32 z m -50.90999985,16.4 a 8,8 0 0 0 -7.99999995,8 v 32 a 8,8 0 0 0 16,0 v -32 a 8,8 0 0 0 -8.00000005,-8 m -50.91000015,-16.4 -22.63,22.62 a 8.0044488,8.0044488 0 0 0 11.32,11.32 l 22.62,-22.63 a 8,8 0 0 0 -11.31,-11.31 m -5.09,-39.59999987 a 8,8 0 0 0 -8,-8.00000003 h -32 a 8,8 0 0 0 0,16 h 32 a 8,8 0 0 0 8,-7.99999997 m -6.22,-73.54000013 a 8.0044488,8.0044488 0 0 0 -11.32,11.32 l 22.63,22.62 a 8,8 0 0 0 11.31,-11.31 z"
                  id="path2" />
            </g>}
    </svg>
}