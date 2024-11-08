import _ from 'lodash'
export const getParams = (
  paramsObj: Object = {},
  deviceInfo: { isMobile: boolean; fields: { [key in 'MOBILE' | 'DESKTOP']: string } }
): string => {
  const params = {
    ...(Object.keys(paramsObj).length ? paramsObj : {}),
    fields: deviceInfo.isMobile ? deviceInfo.fields.MOBILE : deviceInfo.fields.DESKTOP
  }
  let result = '?'
  Object.entries(params).forEach(([key, value], i) => {
    result = `${result}${i === 0 ? '' : '&'}${key}=${value}`
  })

  return result
}

// IMPORTANT NOTE - This needs to be a function as window faste is not available at the time of import
export const getUserPrefix = () => `/users/${_.get(window, 'faste.store.user._value.username')}`
// TODO Uncomment above line and remove below line to use real username
// export const getUserPrefix = () => '/users/9146406.cbus@bayer.test'
export const getUserName = () => _.get(window, 'faste.store.user._value.username')
