import { Card, Color, NormedCard } from 'mtgql'

export function getColors(card: Card | NormedCard): Color[] {
  const colorSet = new Set<Color>();
  for (const color of card.colors??[]) {
    colorSet.add(color);
  }
  for (const color of card.color_indicator??[]) {
    colorSet.add(color);
  }
  for (const face of card.card_faces??[]) {
    for (const color of face.colors??[]) {
      colorSet.add(color);
    }
    for (const color of face.color_indicator??[]) {
      colorSet.add(color);
    }
  }

  return Array.from(colorSet);
}