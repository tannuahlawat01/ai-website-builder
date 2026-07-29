const keepAlive = (url) => {
  setInterval(async () => {
    try {
      await fetch(`${url}/health`)
      console.log('Keep-alive ping sent')
    } catch (err) {
      console.log('Keep-alive failed:', err.message)
    }
  }, 14 * 60 * 1000) // ping every 14 minutes
}

module.exports = keepAlive