async function fetchConfig () {
    const { serverUrl } = await fetch('/config')
    window.serverUrl = serverUrl
    await import('./magic')
}
fetchConfig()
