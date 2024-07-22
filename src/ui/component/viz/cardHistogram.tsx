import React, { useMemo } from "react";
import { Card } from "mtgql";
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { PlotFunction, plotFunctionLookup } from './types'
import _groupBy from 'lodash/groupBy'
import {
  ChartOptions, Chart, ChartEvent,
  BarController, BarElement, CategoryScale, LinearScale, Tooltip
} from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
import { Bar } from 'react-chartjs-2'

export interface CardHistogramProps {
  cards: EnrichedCard[]
  xfunc: PlotFunction
  onClick?: (cards: Card[]) => void;
}

export function CardHistogram({ cards, xfunc, onClick }: CardHistogramProps) {
  const xFunction = plotFunctionLookup[xfunc]
  const style = getComputedStyle(document.documentElement)

  const [chartData, rawData] = useMemo(() => {
    const rawValues = _groupBy(cards, (car) => xFunction.getDatum(car.data))
    const data = {
      datasets: [
        {
          data: Object.entries(rawValues).map(([k, v]) => ({ x: k, y: v.length })),
          backgroundColor: style.getPropertyValue('--active')
        }
      ]
    }
    return [data, rawValues]
  }, [cards, xfunc])

  let lightColor = style.getPropertyValue('--light-color')
  const gridColor = `color-mix(in oklch, ${lightColor}, transparent 70%)`
  const options: ChartOptions<'bar'> = {
    animation: false,
    responsive: true,
    scales: {
      x: {
        title: {
          text: xFunction.text,
          display: true,
          color: lightColor
        },
        grid: { color: gridColor },
        ticks: {
          color: lightColor,
          backdropColor: lightColor
        }
      },
      y: {
        title: {
          text: 'count',
          display: true,
          color: lightColor
        },
        grid: { color: gridColor },
        ticks: {
          color: lightColor,
          backdropColor: lightColor
        }
      }
    },
    onClick(_: ChartEvent, el) {
      if (el.length === 1 && onClick) {
        const elX = chartData.datasets[0].data[el[0].index].x;
        onClick(rawData[elX].map(it => it.data))
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        footerFont: {
          family: 'Monospace'
        },
        callbacks: {
          title: ctx => `${xFunction.text}: ${ctx[0].label}`,
          label: ctx => `total: ${ctx.formattedValue}`,
          footer: ctx => {
            const cards = rawData[ctx[0].label]
            const sortedValues = cards.map(it => it.data.name.replace(/ \/\/.*$/, '')).sort()
            return cardListToolTipText(sortedValues)
          }
        }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}


function cardListToolTipText(cardNames: string[]): string {
  let maxLengthA = Number.MIN_VALUE
  let maxLengthB = Number.MIN_VALUE

  for (let index = 0; index < cardNames.length; index++) {
    const element = cardNames[index]
    if (Math.floor(index % 3) == 1) {
      maxLengthB = Math.max(maxLengthB, element.length)
    } else if (Math.floor(index % 3) == 0) {
      maxLengthA = Math.max(maxLengthA, element.length)
    }
  }
  return cardNames
    .map((item, index) => {
      if (Math.floor(index % 3) === 2) {
        return `— ${item}\n`
      } else if (Math.floor(index % 3) === 1) {
        return `— ${item.padEnd(maxLengthB + 2)}`
      } else {
        return `— ${item.padEnd(maxLengthA + 2)}`
      }
    })
    .join('')
    .trim()
}