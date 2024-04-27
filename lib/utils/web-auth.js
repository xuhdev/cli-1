const { webAuthCheckLogin } = require('npm-profile')

async function webAuth (opener, initialUrl, doneUrl, opts) {
  const abortController = new AbortController()

  const openPromise = opener(initialUrl, abortController.signal)
  const webAuthCheckPromise = webAuthCheckLogin(doneUrl, { ...opts, cache: false })
    .then(authResult => authResult.token)
    // cancel open prompt if it's present
    .finally(() => abortController.abort('abort'))

  await openPromise
  return await webAuthCheckPromise
}

module.exports = webAuth
