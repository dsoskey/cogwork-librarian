import cubecobraImage from '../../icons/cubecobra-favicon.ico'
import cubeartisanImage from '../../icons/cubeartisan-favicon.ico'
import React from 'react'
import { Cube, CubeSource } from 'mtgql'

export const CUBE_SOURCE_TO_LABEL: Record<CubeSource, string> = {
  cubeartisan: 'CubeArtisan', cubecobra: 'Cube Cobra', list: 'a text list'
}

export const SourceIcon = ({ source }: { source: CubeSource }) => {
  const label = CUBE_SOURCE_TO_LABEL[source]
  switch (source) {
    case 'list':
      return <span title={label}>📄</span>
    case 'cubecobra':
      return <img src={cubecobraImage} alt={label} title={label} height='100%' />
    case 'cubeartisan':
      return <img src={cubeartisanImage} alt={label} title={label} height='100%' />
  }
}

export function cubeLink(cube: Cube): string {
  switch (cube.source) {
    case 'cubeartisan':
      return `https://cubeartisan.net/cube/${cube.key}/overview`
    case 'cubecobra':
      return `https://cubecobra.com/cube/overview/${cube.key}`
    case 'list':
      return '#'
  }
}

export function SourceLink({ cube }: { cube: Cube }) {
  return <a href={cubeLink(cube)}
     rel='noreferrer'
     target='_blank'>
    <SourceIcon source={cube.source} />
  </a>
}