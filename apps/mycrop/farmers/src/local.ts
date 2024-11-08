/*
  Webpack module federation requires the use of dynamic imports,
  so the module default export is a promise that resolves with the FasteModule object from ./localBootstrap
  https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption
*/
const ModulePromise = import('./localBootstrap') // as unknown as Promise<FasteModule>
export default ModulePromise
