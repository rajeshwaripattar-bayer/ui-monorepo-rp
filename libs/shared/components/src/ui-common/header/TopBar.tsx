import styles from './TopBar.module.scss'
import { TypoDisplay } from '@element/react-typography'
import MenuButton from '../button/MenuButton'

/* eslint-disable-next-line */
export interface TopBarProps {
  title: string
  trailingBlock?: React.ReactElement
  leadingBlock?: React.ReactElement
  className?: string
  moreActions?: { icon: string; data?: object; listItems: { value: string; label: string; onClick: () => void }[] }
}

export function TopBar(props: TopBarProps) {
  return (
    <div className={props.className ? `${styles[props.className]} ${styles['top_bar']}` : styles['top_bar']}>
      {props.leadingBlock && <div className={styles['leading_block']}>{props.leadingBlock}</div>}
      <TypoDisplay className={styles.title} level={6}>
        {props.title}
      </TypoDisplay>
      {props.trailingBlock && <div className={styles['trailing_block']}>{props.trailingBlock}</div>}
      {props.moreActions && (
        <div className={styles['more_action']}>
          <MenuButton {...props.moreActions} />
        </div>
      )}
    </div>
  )
}

export default TopBar
