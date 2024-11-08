import { useMediaQuery } from 'react-responsive'

export const useScreenRes = (): number => {
  return [
    useMediaQuery({ maxWidth: 599 }),
    useMediaQuery({ minWidth: 600, maxWidth: 719 }),
    useMediaQuery({ minWidth: 720, maxWidth: 839 }),
    useMediaQuery({ minWidth: 840, maxWidth: 1023 }),
    useMediaQuery({ minWidth: 1024, maxWidth: 1439 }),
    useMediaQuery({ minWidth: 1440 })
  ].findIndex((item) => item)
}
