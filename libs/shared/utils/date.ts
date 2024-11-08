import moment from 'moment'
import { Locale } from '@gc/types'

export function calculateOffsetDate(timePeriod: string, duration: number) {
  const date = new Date()
  switch (timePeriod) {
    case 'month':
      date.setMonth(date.getMonth() + duration)
      break
    case 'week':
      date.setDate(date.getDate() + 7 * duration)
      break
    default:
      date.setDate(date.getDate() + duration)
  }
  return date
}

export function formatDateWithTimezoneOffset(inputDate?: Date) {
  return inputDate ? moment(inputDate).format('yyyy-MM-DDTHH:mm:ssZZ') : ''
}

export function getLongDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale.code, {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  })
}

export function getDateFromUTC(date: Date, locale: Locale): string {
  return date ? date.toLocaleDateString(locale.code, { year: '2-digit', month: '2-digit', day: '2-digit' }) : ''
}
