import { ReactNode } from 'react'
import styles from './SubHeader.module.scss'
import List from '../../ui-common/list/List'
import Loading from '../../ui-common/loading/Loading'
import { TypoBody } from '@element/react-typography'
import { Icon } from '@element/react-components'

/* eslint-disable-next-line */
export interface SubHeaderProps {
  title: ReactNode
  subtitle: ReactNode
  trailingBlock?: ReactNode
  loading?: boolean
  className?: string
  error?: boolean | undefined
}

export function SubHeader(props: SubHeaderProps) {
  const getStyledSubHeaderContent = () => {
    const items: Array<object> = []
    items.push({
      code: 'SubHeader',
      overlineText: props.title,
      primaryText: props.subtitle,
      trailingBlock: props.trailingBlock && props.trailingBlock
    })
    return items
  }
  return (
    <div className={`${styles.sub_header} ${props.className}`}>
      {props.loading ? (
        <Loading />
      ) : props.error ? (
        <TypoBody level={2}>Couldn't load remaining credit limit</TypoBody> // TODO: Waiting for UX design
      ) : (
        <List items={getStyledSubHeaderContent()} noHover />
      )}
    </div>
  )
}

export default SubHeader
