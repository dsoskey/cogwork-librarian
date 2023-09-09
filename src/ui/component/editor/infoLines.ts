import { SCORE_PRECISION, weightAlgorithms } from '../../../api/queryRunnerCommon'

export const scoreInfo = (count: number) =>
  weightAlgorithms.zipf(count - 1).toFixed(SCORE_PRECISION)
export const rankInfo = (count: number) =>
  count > 1 ? `${' '.repeat(4 - count.toString().length)}${count}` : 'SUB1'
