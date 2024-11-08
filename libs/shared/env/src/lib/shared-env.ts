const getEnv = (name: string): string => {
  const val = process.env[name]
  if (val === undefined) {
    if (process.env['NODE_ENV'] === 'test') {
      return name
    }
    throw new Error(name + ' env variable is not set')
  }
  return val
}

export const C7_ACCESS_TOKEN_URL = getEnv('NX_C7_ACCESS_TOKEN_URL')
export const COMMERCE_CLOUD_API = getEnv('NX_COMMERCE_CLOUD_API')
export const FG_COMMERCE_CLOUD_API = getEnv('NX_FG_COMMERCE_CLOUD_API')
export const GC_MIDDLEWARE_API = getEnv('NX_GC_MIDDLEWARE_API')
export const FINANCE_API = getEnv('NX_FINANCE_API')
