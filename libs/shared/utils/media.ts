import { resolutions } from '@gc/constants'

export function getTypoDisplayLevel(res: number) {
  if (res <= resolutions.M839) {
    return 5
  } else if (res <= resolutions.D1439) {
    return 4
  } else {
    return 3
  }
}

export function scrollTop() {
  window.scrollTo(0, 0)
  const scrollableElements = document.querySelectorAll('*')
  scrollableElements.forEach((element) => {
    const rect = element.getBoundingClientRect()
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
    const isScrollable = element.scrollHeight > element.clientHeight
    if (isScrollable && isVisible) {
      element.scrollTop = 0
    }
  })
}
