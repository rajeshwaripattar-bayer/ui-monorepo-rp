import styles from './ModalTopBar.module.scss'
import { IconButton, IconButtonProps } from '@element/react-icon-button'
import { TypoDisplay } from '@element/react-typography'
import { ReactNode } from 'react'
export interface ModalTopBarProps {
  title?: string
  exitIconButtonProps?: IconButtonProps
  trailingIconButtonProps?: IconButtonProps
  trailingContent?: ReactNode
  topBarContent?: ReactNode
}

export function ModalTopBar(props: ModalTopBarProps) {
  const { title, topBarContent, exitIconButtonProps } = props
  let trialingContent = props.trailingContent
  if (!trialingContent && props.trailingIconButtonProps) {
    trialingContent = <IconButton {...props.trailingIconButtonProps} />
  }

  return (
    <div className={styles.container}>
      {topBarContent ? (
        topBarContent
      ) : (
        <>
          <IconButton className={styles['modal_back_button']} icon='close' {...exitIconButtonProps} />
          <TypoDisplay level={6}>{title}</TypoDisplay>
          {trialingContent && <div className={styles.trailing_content}>{trialingContent}</div>}
        </>
      )}
    </div>
  )
}

export default ModalTopBar
