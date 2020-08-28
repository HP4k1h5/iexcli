import qs from 'querystring'
import fs from 'fs'

import { config } from '../util/config.js'
import { qFetch } from './qFetch.js'
import { getWatchlistIex } from './iex.js'
import { shapeAccountAlpaca } from '../shape/shapeAlpaca.js'

let alpacaTokens
if (config['APCA_API_KEY_ID'] && config['APCA_API_KEY_ID'].length) {
  alpacaTokens = {
    'APCA-API-KEY-ID': config['APCA_API_KEY_ID'],
    'APCA-API-SECRET-KEY': config['APCA_API_SECRET_KEY'],
  }
}

const baseURLs = {
  paper: 'https://paper-api.alpaca.markets/v2',
  live: 'https://api.alpaca.markets/v2',
}
const baseURL = baseURLs[config.alpacaAccountType]

export function buildAlpacaURL(method, path, params, body) {
  const queryString = qs.encode(params)
  const url = `${baseURL}/${path}?${queryString}`

  const httpOptions = {
    method,
    headers: alpacaTokens,
  }

  if (body) {
    httpOptions.body = JSON.stringify(body)
    httpOptions.headers['Content-Type'] = 'application/json'
  }

  return { url, httpOptions }
}

export async function getAccountAlpaca(options) {
  if (!alpacaTokens) {
    return
  }

  const accountUrl = buildAlpacaURL('GET', 'account')
  const positionsUrl = buildAlpacaURL('GET', 'positions')
  const portfolioUrls = [
    { period: '1D' },
    { period: '1W' },
    { period: '1M' },
    { period: '1A' },
  ].map((params) => {
    const { url: portfolioUrl } = buildAlpacaURL(
      'GET',
      'account/portfolio/history',
      params,
    )
    return portfolioUrl
  })

  const urls = [accountUrl, positionsUrl, ...portfolioUrls]

  const data = await Promise.all(
    urls.map(async (url) => {
      return await qFetch(options, url.url, url.httpOptions)
    }),
  )

  return shapeAccountAlpaca(data)
}

export async function submitOrder(_ws, order) {
  order.time_in_force = 'day'
  order.type = 'market'
  const { url, httpOptions } = buildAlpacaURL('orders', 'POST', null, order)

  let response = await qFetch(options, url, httpOptions)

  return response
}

export async function getWatchlistAlpaca(options) {
  const { url, httpOptions } = buildAlpacaURL('GET', 'watchlists')

  let response = await qFetch(options, url, httpOptions)

  const wlNames = []
  const urls = response.map((r) => {
    wlNames.push(r.name)
    return buildAlpacaURL('GET', `watchlists/${r.id}`)
  })

  response = await Promise.all(
    urls.map(async (url) => {
      return await qFetch(options, url.url, url.httpOptions)
    }),
  )

  response = await Promise.all(
    response.map(async (wl) => {
      options.watchlist = wl.assets.map((a) => a.symbol)
      return await getWatchlistIex(options)
    }),
  )

  return response.reduce((a, v, i) => {
    let line = v[0].map(() => '--')
    line[1] = wlNames[i]
    v.unshift(line)
    return [...a, ...v]
  }, [])
}
