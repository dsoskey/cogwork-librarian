import React, { useContext } from 'react'
import "./querySetButton.css";
import { CogDBContext } from '../../api/local/useCogDB'

const LoaderButton = ({ vh, vw, count, total }) => {
  const startPC = 1 / 4;
  const endPC = 3 / 4;
  const rx = (vw + vh) / 2 * .2 ;
  const trianglePoints = [
    {x: vw * startPC, y: vh * startPC },
    {x: vw * startPC, y: vh * endPC },
    {x: vw * endPC, y: vh * .5 },
  ]
  const joined = trianglePoints.map(({x, y}) => `${x},${y}`).join(" ")
  return <svg className='loading-button' width='1.25em' height='1.25em' viewBox={`0 0 ${vw} ${vh}`}>
    <clipPath id="myClip" width={vw} height={vh}>
      <rect width={total === 0 ? 0 : (vw * count) / total} height={vh} />
    </clipPath>

    <rect clipPath="url(#myClip)" className='background' width={vw} height={vh} rx={rx} />
    <polygon
      className='play'
      clipPath="url(#myClip)"
      points={joined}
      height={vh/2}
      width={vw/2}
    />
  </svg>
}

export const QuerySetButton = () => {
  const { dbReport, memStatus } = useContext(CogDBContext);
  const { cardCount, totalCards } = dbReport;
  const viewWidth = 100;
  const viewHeight = 100;
  return <LoaderButton vw={viewWidth} vh={viewHeight} count={cardCount} total={memStatus === "success" ? cardCount : totalCards} />
}