import React from 'react'
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { Setter } from '../../../types'
import { PlotFunction, plotFunctionLookup } from '../../component/viz/types'
import { CardPlot } from '../../component/viz/cardPlot'
import { CardHistogram } from '../../component/viz/cardHistogram'
import { useLocalStorage } from '../../../api/local/useLocalStorage'

export interface CardVizViewProps {
  cards: EnrichedCard[]
}

enum VizType {
  plot,
  hist
}
interface VizTypeRep {
  text: string
  numAxes: number
}

export const vizTypeLookup: Record<VizType, VizTypeRep> = {
  [VizType.hist]: {
    text: "histogram",
    numAxes: 1
  },
  [VizType.plot]: {
    text: "scatter plot",
    numAxes: 2,
  }

}

export function CardVizView({ cards }: CardVizViewProps) {
  const [vizType, setVizType] = useLocalStorage<VizType>("vizType", VizType.plot);
  const [xFunc, setXFunc] = useLocalStorage<PlotFunction>("xFunc", PlotFunction.year);
  const [yFunc, setYFunc]= useLocalStorage<PlotFunction>("yFunc", PlotFunction.fullWordCount);
  const vizTypeRep = vizTypeLookup[vizType];

  return <div className="card-viz">
    <div className='row'>
      <label>
        <span>chart:{" "}</span>
        <select value={vizType} onChange={e => setVizType(parseInt(e.target.value) as VizType)}>
          {Object.entries(vizTypeLookup).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
        </select>
      </label>
      <PlotFuncSelect func={xFunc} setFunc={setXFunc} label="x axis:" />
      {vizTypeRep.numAxes === 2 && <PlotFuncSelect func={yFunc} setFunc={setYFunc} label="y axis:" />}
    </div>
    {vizType === VizType.plot && <CardPlot cards={cards} xfunc={xFunc} yfunc={yFunc} />}
    {vizType === VizType.hist && <CardHistogram cards={cards} xfunc={xFunc} />}
  </div>;
}


interface PlotFuncSelectProps {
  func: PlotFunction
  setFunc: Setter<PlotFunction>
  label: React.ReactNode
}

function PlotFuncSelect({ func, setFunc, label }: PlotFuncSelectProps) {
  return <label>
    <span>{label}{" "}</span>
    <select value={func} onChange={e => {
    setFunc(parseInt(e.target.value) as PlotFunction)
  }}>
    {Object.entries(plotFunctionLookup).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
    </select>
  </label>;
}