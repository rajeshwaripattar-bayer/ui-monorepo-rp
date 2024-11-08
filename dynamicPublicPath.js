const getPublicPath = (moduleName, localPort) => {
  if (process.env.PUBLIC_PATH_ENV === 'np') return `https://c7-np.cdn.bayer.com/modules/${moduleName}/stable/`
  if (process.env.PUBLIC_PATH_ENV === 'prod') return `https://c7.cdn.bayer.com/modules/${moduleName}/stable/`
  return `https://localhost:${localPort}/`
}

module.exports = { getPublicPath }
