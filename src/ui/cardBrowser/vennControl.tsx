import React, { useState } from 'react'
import { CardDisplayInfo, VennSection } from './types'

interface UseVennControl {
  activeSections: Array<VennSection>
  toggleVennSection: (section: VennSection) => () => void
}
interface VennControlProps extends UseVennControl {
  cards: CardDisplayInfo
  leftText?: string
  rightText?: string
}

export const useVennControl = (): UseVennControl => {
  const [activeSections, setActiveSections] = useState<VennSection[]>(["left", "right", "both"])
  const toggleVennSection = (value: VennSection) => () => {
    setActiveSections(prev => {
      if (prev.includes(value)) {
        return prev.filter(it => it !== value)
      } else {
        return [...prev, value]
      }
    })
  }
  return { activeSections, toggleVennSection }
}
export const VennControl = ({ rightText, leftText, cards, activeSections, toggleVennSection }: VennControlProps) => {
  const keyDown = (section: VennSection) => (event: React.KeyboardEvent<SVGTextElement>) => {
    if (event.key === " ") {
      event.preventDefault();
    }
    // If enter is pressed, activate the button
    else if (event.key === "Enter") {
      event.preventDefault();
      toggleVennSection(section)()
    }
  }
  const keyUp = (section: VennSection) => (event: React.KeyboardEvent<SVGTextElement>) => {
    if (event.key === " ") {
      event.preventDefault();
      toggleVennSection(section)()
    }
  }

  const r = 30
  const height = "75"
  const width = "210"
  return <svg className='venn-control-root' viewBox={`0 0 ${width} ${height}`} height={`${height}px`} width={`${width}px`}>
    {/*<rect x="0" y="0" width={width} height={height} fill="green"/>*/}
    <defs>
      <clipPath id="both-clip">
        <ellipse rx={`${r-1}%`} ry={`${r-1}%`} cx={`35.3%`} cy="50%" />
      </clipPath>
    </defs>

    <ellipse rx={`${r}%`} ry={`${r}%`} cx="65%" cy="50%" className="bordered"
      fill={activeSections.includes("right") ? "var(--active)":"var(--light-color)"}
      onClick={toggleVennSection("right")}
    >
      <title>{rightText ?? "right count"} - {activeSections.includes("right")?"active":"inactive"}</title>
    </ellipse>
    <ellipse rx={`${r}%`} ry={`${r}%`} cx="35%" cy="50%" className="bordered"
             fill={activeSections.includes("left") ? "var(--active)":"var(--light-color)"}
             onClick={toggleVennSection("left")}
    >
      <title>{leftText ?? "left count"} - {activeSections.includes("left")?"active":"inactive"}</title>
    </ellipse>

    <ellipse rx={`${r}%`} ry={`${r}%`} cx="65%" cy="50%" clipPath="url(#both-clip)" className="bordered"
      fill={activeSections.includes("both") ? "var(--active)":"var(--light-color)"}
      onClick={toggleVennSection("both")}
    >
      <title>both count - {activeSections.includes("both")?"active":"inactive"}</title>

    </ellipse>
    <text textAnchor="middle" x="23%" y="55%"
      tabIndex={0} role="button"
      onClick={toggleVennSection("left")}
      onKeyDown={keyDown("left")}
      onKeyUp={keyUp("left")}
    >{cards.leftCount}</text>
    <text textAnchor="middle" x="50%" y="55%"
      tabIndex={0} role="button"
      onClick={toggleVennSection("both")}
      onKeyDown={keyDown("both")}
      onKeyUp={keyUp("both")}
    >{cards.bothCount}</text>
    <text textAnchor="middle" x="77%" y="55%"
      tabIndex={0} role="button"
      onClick={toggleVennSection("right")}
      onKeyDown={keyDown("right")}
      onKeyUp={keyUp("right")}
    >{cards.rightCount}</text>
  </svg>
}