import styles from './Alert.module.scss'
import { Padding } from '@element/react-padding'
import { TypoSubtitle } from '@element/react-typography'
import { Icon } from '@element/react-icon'
import { Button, ButtonProps } from '@element/react-button'
import { useMemo } from 'react'

/* eslint-disable-next-line */
export interface AlertProps {
  className?: string
  title?: string
  description?: string
  type: 'info' | 'warning' | 'error' | 'success' //mandatory field
  variant?: 'tonal' | 'filled' | 'outlined' //default is filled
  actionButtonProps?: ButtonProps
}

function getIcon(alertType: AlertProps['type']) {
  switch (alertType) {
    case 'info':
    case 'error':
    case 'warning':
      return alertType
    case 'success':
      return 'check_circle'
  }
}

function getVariant(variant?: AlertProps['variant']) {
  return variant ? variant : 'filled'
}

function getActionButtonProps(actionButtonProps: AlertProps['actionButtonProps'], variant?: AlertProps['variant']) {
  if (!actionButtonProps) return

  const buttonProps: ButtonProps = { ...actionButtonProps }

  if (!buttonProps.variant) {
    buttonProps.variant = getVariant(variant)
  }

  if (!buttonProps.className) {
    buttonProps.className = styles.text
  }
  return buttonProps
}

export function Alert(props: AlertProps) {
  const icon = getIcon(props.type)
  const iconClass = useMemo(() => props.type + '_' + getVariant(props.variant), [props.type, props.variant])
  const actionButtonProps: ButtonProps | undefined = useMemo(
    () => getActionButtonProps(props.actionButtonProps, props.variant),
    [props.actionButtonProps, props.variant]
  )
  const showActionButton = actionButtonProps !== undefined
  const paddingClassName = styles[iconClass] + ' ' + styles.alert + ' ' + props.className
  const infoContainerClassName = showActionButton
    ? styles.info_container + ' ' + styles.show_action_button
    : styles.info_container

  return (
    <Padding className={paddingClassName} variant='standard'>
      <div id='quote-details-alert' className={styles.container}>
        <div id='quote-details-alert-info-container' className={infoContainerClassName}>
          <div className={styles.icon_container}>
            <Icon className={styles.icon} icon={icon} iconSize='small' />
          </div>
          <div className={styles.text_container}>
            {props.title && (
              <TypoSubtitle level={2} bold className={styles.title + ' ' + styles.text}>
                {props.title}
              </TypoSubtitle>
            )}
            {props.description && (
              <TypoSubtitle level={2} className={styles.description + ' ' + styles.text}>
                {props.description}
              </TypoSubtitle>
            )}
          </div>
        </div>
        {showActionButton && (
          <div className={styles.action_container}>
            <Button {...actionButtonProps} />
          </div>
        )}
      </div>
    </Padding>
  )
}

export default Alert
