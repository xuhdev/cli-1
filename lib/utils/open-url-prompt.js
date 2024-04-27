const { promises: readline } = require('node:readline')
const { once } = require('node:events')
const { output, input } = require('proc-log')
const open = require('./open-url.js')

// Prompt to open URL in browser if possible
const promptOpen = async (npm, url, title, prompt, signal) => {
  const browser = npm.config.get('browser')
  const json = npm.config.get('json')

  try {
    if (!/^https?:$/.test(new URL(url).protocol)) {
      throw new Error()
    }
  } catch {
    throw new Error('Invalid URL: ' + url)
  }

  output.standard(json ? JSON.stringify({ title, url }) : `${title}:\n${url}`)

  if (browser === false || !npm.interactive) {
    return
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const tryOpen = await input.start(() => Promise.race([
    once(rl, 'SIGINT').then(() => {
      throw new Error('canceled')
    }),
    rl.question(prompt, { signal }).then(() => true).catch((err) => {
      if (err.name === 'AbortError') {
        return false
      }
      throw err
    }),
  ]).finally(() => {
    output.standard('')
    rl.close()
  }))

  if (!tryOpen) {
    return
  }

  await open(npm, url, 'Browser unavailable.  Please open the URL manually')
}

module.exports = promptOpen
