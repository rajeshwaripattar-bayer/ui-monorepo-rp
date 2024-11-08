import styles from './MessageWithAction.module.scss'
import { Icon, IconProps } from '@element/react-icon'
import { TypoSubtitle, TypoBody } from '@element/react-typography'

import { Button, ButtonProps } from '@element/react-button'

/* eslint-disable-next-line */
export interface MessageWithActionProps {
  className?: string
  iconProps?: IconProps & React.HTMLProps<HTMLElement>
  messageHeader: string
  messageDescription?: string
  primaryButtonProps?: ButtonProps
  secondaryButtonProps?: ButtonProps
}

export function MessageWithAction(props: MessageWithActionProps) {
  return (
    <div className={`${styles.container} ${props.className || ''}`}>
      {props.iconProps?.icon && (
        <div>
          <Icon {...props.iconProps} />
        </div>
      )}
      <div className={styles.header}>
        <TypoSubtitle level={1} bold>
          {props.messageHeader}
        </TypoSubtitle>
        {props.messageDescription && (
          <div>
            <TypoBody level={2}>{props.messageDescription}</TypoBody>
          </div>
        )}
      </div>
      {props.primaryButtonProps && (
        <Button className={styles.action} buttonSize='medium' {...props.primaryButtonProps} />
      )}
      {props.secondaryButtonProps && (
        <Button className={styles.action} buttonSize='medium' {...props.secondaryButtonProps} />
      )}
    </div>
  )
}

export default MessageWithAction
