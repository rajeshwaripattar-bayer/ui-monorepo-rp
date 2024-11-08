const fs = require('fs')
const existingConfig = require('./spectrum.config.json')

// Retrieve arguments passed from npm script
const [entryPair = null, assetsPair = null, cmdbPair=null] = process.argv.slice(2)

if (!entryPair || !assetsPair) return "Missing arguments. Required [entry, assets]"

// split key value pair recieved from npm script
const [entryKey, entryVal] = entryPair.split('=')
const [assetsKey, assetsVal] = assetsPair.split('=')

if (!entryVal || !assetsVal) return "Missing arguments. Required [entry, assets]"
const regexCheck = /\.(css)$/
const assets = regexCheck.test(assetsVal) ? [assetsVal] : assetsVal

existingConfig.faste.entry = entryVal
existingConfig.faste.assets = assets
if (cmdbPair) {
  const [cmdbKey, cmdbVal] = cmdbPair.split('=')
  existingConfig.faste.cmdb = cmdbVal
}

// Write back to the JSON file
fs.writeFileSync('./spectrum.config.json', JSON.stringify(existingConfig, null, 2))
console.log("Spectrum config file updated.")
