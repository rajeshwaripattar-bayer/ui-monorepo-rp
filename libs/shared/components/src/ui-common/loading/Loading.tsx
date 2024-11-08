import styles from './Loading.module.scss'
import { LinearProgress } from '@element/react-linear-progress'
import { TypoCaption } from '@element/react-typography'
/* eslint-disable-next-line */
export interface LoadingProps {
  label?: string
  className?: string
}

export function Loading(props: LoadingProps) {
  return (
    <div className={`${styles.loading} ${props.className}`}>
      <LinearProgress />
      <TypoCaption>{props.label}</TypoCaption>
    </div>
  )
}
export default Loading
