async function fetchConfig () {
  const { serverUrl } = await fetch('/config').then((res) => res.json())
  window.serverUrl = serverUrl
  await import('./magic.js')
}
fetchConfig()
