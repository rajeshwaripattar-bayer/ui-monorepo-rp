import map from 'lodash/map'
import fill from 'lodash/fill'

export const range = (start: number, stop: number, step: number = 1) =>
  map(fill(Array(Math.ceil((stop - start) / step)), start), (x, y) => x + y * step)
