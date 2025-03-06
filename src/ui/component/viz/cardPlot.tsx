import React, { useMemo } from 'react'
import { Card } from 'mtgql'
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { PlotFunction, PLOT_FUNCTIONS } from './types'
import {
  ChartEvent, ChartOptions, Chart,
  ScatterController, PointElement, LinearScale,
  Tooltip,
} from 'chart.js'
Chart.register(ScatterController, PointElement, LinearScale,Tooltip);
import { Scatter } from 'react-chartjs-2'


export interface CardPlotProps {
  cards: EnrichedCard[]
  xfunc: PlotFunction
  yfunc: PlotFunction
  onPointClick?: (cards: Card[]) => void;
}

export function CardPlot({ cards, xfunc, yfunc, onPointClick }: CardPlotProps) {
  const xFunction = PLOT_FUNCTIONS[xfunc]
  const yFunction = PLOT_FUNCTIONS[yfunc]
  const style = getComputedStyle(document.documentElement)

  const data = useMemo(() => {
    return {
      labels: cards.map(c => c.data.name.replace(/ \/\/.*$/, '')),
      datasets: [
        {

          data: cards.map(card => {
            const x = xFunction.getDatum(card)
            const y = yFunction.getDatum(card)

            return { x, y }
          }),
          backgroundColor: style.getPropertyValue('--active')
        }
      ]
    }
  }, [cards, xFunction, yFunction])

  let lightColor = style.getPropertyValue('--light-color')
  const options: ChartOptions<'scatter'> = {
    animation: false,
    responsive: true,
    scales: {
      x: {
        title: { text: xFunction.text, display: true, color: lightColor },
        grid: { color: `color-mix(in oklch, ${lightColor}, transparent 70%)` },
        ticks: {
          color: lightColor,
          backdropColor: lightColor
        }
      },
      y: {
        title: { text: yFunction.text, display: true, color: lightColor },
        grid: { color: `color-mix(in oklch, ${lightColor}, transparent 70%)` },
        ticks: {
          color: lightColor,
          backdropColor: lightColor
        }
      }
    },
    onClick(_: ChartEvent, el) {
      if (el.length && onPointClick) {
        onPointClick(el.map(it => cards[it.index].data))
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: ctx => {
            return `${ctx.length} cards`
          },
          label: ctx => {
            return `${ctx.label} ${ctx.formattedValue}`
          }
        }
      }
    }
  }
  return <Scatter data={data} options={options} />
}