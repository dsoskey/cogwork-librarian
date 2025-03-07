import React, { useMemo } from "react";
import { Card } from 'mtgql'
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { GroupFunction, PlotFunction, PLOT_FUNCTIONS, GROUP_FUNCTIONS } from './types'
import _groupBy from 'lodash/groupBy'
import {
  ChartOptions, Chart, ChartEvent,
  BarController, BarElement, CategoryScale, LinearScale, Tooltip
} from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
import { Bar } from 'react-chartjs-2'
import sortBy from 'lodash/sortBy'


export function use1DData(cards: EnrichedCard[], xfunc: PlotFunction, xGroup: GroupFunction) {
  const xFunctionRep = PLOT_FUNCTIONS[xfunc]
  const xGroupRep = GROUP_FUNCTIONS[xGroup]
  return useMemo(() => {
    const ungroupedRawValues = _groupBy(cards, xFunctionRep.getDatum)
    const subgroupedData = _groupBy(cards, xGroupRep.getGroup);
    const datasets = Object.entries(subgroupedData)
      .map(([groupKey, value]) => {
        const metadata = xGroupRep.getGroupMetadata(groupKey)
        const rawValues = _groupBy(value, xFunctionRep.getDatum)
        let data = Object.keys(ungroupedRawValues).map(key => {
          return { x: key, y: rawValues[key]?.length ?? 0 }
        })
        if (xFunctionRep.sortOrder) {
          data = sortBy(data, [xFunctionRep.sortOrder])
        }
        return {
          data,
          backgroundColor: metadata.color ?? getComputedStyle(document.documentElement).getPropertyValue('--active'),
          rawValues,
          order: metadata.order,
          groupKey,
        }
      })

    const chartData = { datasets }
    return [chartData, ungroupedRawValues]
  }, [cards, xfunc, xGroup])
}

export interface CardHistogramProps {
  cards: EnrichedCard[]
  xfunc: PlotFunction
  xgroup?: GroupFunction
  onClick?: (cards: Card[]) => void;
}

export function CardHistogram({ cards, xfunc, xgroup, onClick }: CardHistogramProps) {
  const xFunctionRep = PLOT_FUNCTIONS[xfunc]
  const xGroupRep = GROUP_FUNCTIONS[xgroup]
  const style = getComputedStyle(document.documentElement)
  const [chartData, rawData] = use1DData(cards, xfunc, xgroup)

  let lightColor = style.getPropertyValue('--light-color')
  const gridColor = `color-mix(in oklch, ${lightColor}, transparent 70%)`
  const options: ChartOptions<'bar'> = {
    animation: false,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: {
          text: xFunctionRep.text,
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
        stacked: true,
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
          title: ctx => {
            const xLabel = ctx[0].label
            // @ts-ignore
            const xGroup = ctx[0].dataset.groupKey
            const groupLabel = xLabel !== xGroup ? ` ${xGroupRep.text}: ${xGroup}` : "";
            return `${xFunctionRep.text}: ${xLabel}${groupLabel}`
          },
          label: ctx => `total: ${ctx.formattedValue}`,
          footer: ctx => {
            // @ts-ignore
            const cards = chartData.datasets[ctx[0].datasetIndex].rawValues[ctx[0].label]
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