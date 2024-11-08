import { Locale } from '@gc/types'

export function appendLeadingZeros(val: string, length: number = 10) {
  return val.padStart(length, '0')
}

export const toUId = (sapId: string | undefined, irdId: string | undefined) => {
  if (sapId) {
    const id = sapId.trim().toUpperCase()
    return appendLeadingZeros(id)
  } else if (irdId) {
    const id = irdId.trim().toUpperCase()
    return id.startsWith('IRD') ? id : `IRD${id}`
  }
  return ''
}

export const fromUId = (uId: string) => {
  const response = { irdId: '', sapId: '' }
  if (!uId) {
    return response
  }
  if (uId.startsWith('IRD')) {
    response.irdId = uId.slice(3)
    return response
  }
  response.sapId = uId
  return response
}

export function getCurrencyFormat(currencyCode: string, value: number, locale: Locale) {
  return value?.toLocaleString(locale.code, {
    style: 'currency',
    currency: `${currencyCode || 'USD'}`
  })
}

export function getRoundedValue(value: number, decimalPlaces?: number): number {
  decimalPlaces = decimalPlaces ?? 2
  return Number(value.toFixed(decimalPlaces))
}

// TODO: this was copied as is from legacy system, unit test then attempt to make simpler
export function getRoundedValueByPower(value: number) {
  const SUFFIXES = ['', 'K', 'M', 'B', 'T']
  const POWERS = [1, 1000, 1000000, 1000000000, 1000000000000]
  const PRECISION = 2
  const isNegative = value < 0 ? -1 : 1
  const absoluteNum = Math.abs(value)
  if (absoluteNum === 0) return absoluteNum.toString()
  let result = ''

  POWERS.forEach((divisor, i) => {
    const suffixIndex = i

    const temp = absoluteNum / divisor
    const precision = PRECISION + 1 - Math.floor(Math.log10(temp) + 1)
    if (precision < 0 || precision > 20) {
      result = absoluteNum.toExponential(0)
      return
    }

    const rounded = parseFloat((absoluteNum / divisor).toFixed(precision))
    if (rounded >= 1) {
      result = `${rounded * isNegative}${SUFFIXES[suffixIndex]}`
      return
    }
    if (rounded >= 0.01 && suffixIndex === 0) {
      result = (rounded * isNegative).toString()
      return
    }
    if (rounded < 0.01 && rounded >= 0 && suffixIndex === 0) {
      result = '<0.01'
      return
    }
    if (rounded < 0 && suffixIndex === 0) {
      result = rounded.toString()
    }
  })

  return result
}

export function isNumeric(value?: string | number): boolean {
  return value != null && value !== '' && !isNaN(Number(value.toString()))
}

export function getDecimalValue(number: string, decimalPlaces?: number) {
  return parseFloat(number).toFixed(decimalPlaces || 2)
}

export function trimObjectValues(obj: { [char: string]: any }) {
  const trimmedObj: { [char: string]: any } = {}
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      trimmedObj[key] = obj[key].trim()
    } else {
      trimmedObj[key] = obj[key]
    }
  }
  return trimmedObj
}

export function getConvertedValue(value: number, type: string, baseValue: number) {
  let result
  if (type === '%') {
    result = (baseValue * value) / 100
  } else {
    result = (value / baseValue) * 100
  }
  return Number(result.toFixed(2))
}

export function nameToObject(name: string) {
  const index = name?.indexOf(' ') || 0
  return { firstName: name.slice(0, index), lastName: name.slice(index).trimStart() }
}
