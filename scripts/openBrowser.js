const { execSync } = require('child_process')
const openChromePath = require.resolve('react-dev-utils/openChrome.applescript')

const arguments = process.argv.slice(2)
if (arguments.length !== 1) {
  console.error('Expecting a single argument for the URL')
} else {
  execSync(`osascript ${openChromePath} ${arguments[0]} "Google Chrome"`, {
    cwd: __dirname,
    stdio: 'ignore'
  })
}
