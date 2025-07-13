import { SCORE_PRECISION, weightAlgorithms } from '../../../api/queryRunnerCommon'

export const BOX_CHARS = {
  horizontal: "─",
  vertical: "│",
  topRight: "└",
  bottomLeft: " ",
  fuckedUpT: "┬",
}

export const scoreInfo = (count: number) =>
  weightAlgorithms.zipf(count - 1).toFixed(SCORE_PRECISION)
export const rankInfo = (count: number) =>
  count > 1 ? `${' '.repeat(4 - count.toString().length)}${count}` : 'SUB1'
export const rankCount = (count: number) => {
  return count.toString().padStart(3);
}
