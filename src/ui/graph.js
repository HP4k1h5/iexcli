import contrib from '@hp4k1h5/blessed-contrib'

import { clear } from '../util/clear.js'
export function buildPriceVolCharts(ws, options, data) {
  clear(ws, options)

  // graph price
  const [y, x, h, w] = options.yxhw
  let priceData = options.indicator
    ? [data.price, ...data.indicators]
    : data
    ? [data.price]
    : data
  options.box = graph(
    ws,
    priceData,
    `[${options.id}  price]`,
    y,
    x,
    h - (options.vol ? 2 : 0),
    w,
  )
  ws.setListeners(options)

  if (!options.vol) return
  // put vol beneath price
  options.volChart = graph(
    ws,
    data ? [data.vol] : data,
    'volume',
    y + h - 2,
    x,
    2,
    w,
  )
}

export function graph(ws, data, label, row, col, height, width) {
  const minY = data ? Math.min(...data[0].y) : 0

  const line = ws.grid.set(row, col, height, width, contrib.line, {
    minY,
    xLabelPadding: 0,
    yLabelPadding: 0,
    xPadding: 0,
    yPadding: 0,
    label,
    wholeNumbersOnly: false,
    showLegend: data ? !!data[0].title : false,
    input: label != 'volume',
    style: {
      line: [100, 100, 100],
      text: [180, 220, 180],
      baseline: [100, 100, 100],
      bold: true,
      focus: { border: { fg: '#ddf' } },
    },
  })
  data && line.setData(data)

  return line
}
