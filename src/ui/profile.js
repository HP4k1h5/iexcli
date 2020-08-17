import blessed from 'blessed'

export function buildProfile(ws, c, target, data, _new) {
  if (_new) {
    target = ws.grid.set(...c.yxhw, blessed.box, {
      name: 'profile',
      label: 'profile',
      keys: false,
      mouse: false,
      tags: true,
      input: false,
      scrollable: false,
    })
  }
  const width = Math.floor(target.width / 2) - 1
  const heightHalf = Math.floor(target.height / 2) - 1

  const company = blessed.text({
    parent: target,
    name: 'company',
    label: 'company',
    // inputs
    mouse: true,
    scrollable: true,
    width,
    height: heightHalf + 3,
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: '#44bbee' },
    },
  })

  const keyStats = blessed.text({
    parent: target,
    name: 'stats',
    label: 'stats',
    // inputs
    mouse: true,
    scrollable: true,
    // style
    width,
    left: width,
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: '#44bbee' },
    },
  })

  const earnings = blessed.text({
    parent: target,
    name: 'earnings',
    label: 'earnings',
    // inputs
    mouse: true,
    scrollable: true,
    // style
    width,
    top: heightHalf + 3,
    height: heightHalf - 3,
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: '#44bbee' },
    },
  })

  // set data
  if (!data) return
  company.setContent(data.company)
  keyStats.setContent(data.keyStats)
  earnings.setContent(data.earnings)
}
