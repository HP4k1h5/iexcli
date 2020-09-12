import fs from 'fs'
import readline from 'readline'

import { fp } from '../util/fs.js'

export class Log {
  constructor(relPath, overwrite) {
    this.filename = fp(relPath)
    this.logger = (function (_this) {
      if (!fs.existsSync(_this.filename)) {
        fs.openSync(_this.filename, 'w')
      }

      return fs.createWriteStream(_this.filename, {
        flags: overwrite ? 'r+' : 'a+',
      })
    })(this)
    this.reader = readline.createInterface({
      input: fs.createReadStream(this.filename, {}),
      console: false,
    })
  }

  log(line) {
    this.logger.write(JSON.stringify(line) + '\n')
  }

  read() {
    async function* read(_this) {
      for await (let line of _this.reader) {
        line = JSON.parse(line)
        yield line
      }
    }
    return read(this)
  }
}

// EXAMPLE

function callMe() {
  // instantiate a new log write stream
  const log = new Log('../../data/log/test_log.jsonl', true)

  // add lines to log. all text is JSON.stringify()'ed
  log.log({ hello: 'world' })
  log.log({ hello: 'world' })
  log.log({ hello: 'world' })

  // read log back with a generator function
  ;(async function () {
    // create read stream
    let reader = log.read()
    // read next values
    let rn = await reader.next()
    while (!rn.done) {
      // all text is JSON.parsed()'ed
      console.log(rn.value)
      rn = await reader.next()
    }
  })()
}
callMe
