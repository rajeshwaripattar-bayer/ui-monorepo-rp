import styles from './Band.module.scss'
import { IconButton, IconButtonProps } from '@element/react-icon-button'
import { Icon, IconProps } from '@element/react-icon'
import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import { Button, ButtonProps } from '@element/react-button'
import { Group } from '@element/react-group'
import { ReactNode, useCallback } from 'react'
export interface BandProps {
  placement: 'table' | 'list'
  backgroundColorClass?: string
  iconProps?: IconProps
  containerClassName?: string
  primaryText: string
  secondaryText?: string
  trailingIconButtonProps?: [IconButtonProps] | [IconButtonProps, IconButtonProps]
  trailingButtonProps?: [ButtonProps, ButtonProps, ButtonProps, ButtonProps]
}

export function Band({
  containerClassName = '',
  primaryText,
  secondaryText,
  placement,
  trailingIconButtonProps,
  trailingButtonProps,
  iconProps,
  backgroundColorClass = 'lmnt-theme-secondary-50-bg'
}: BandProps) {
  const Actions = useCallback(() => {
    let actions: ReactNode[] = []
    if (placement === 'table' && trailingButtonProps?.length) {
      actions = trailingButtonProps?.map((props: ButtonProps, index: number) => (
        <Button key={`${props.label || ''}${index}`} {...props} />
      ))
    } else if (trailingIconButtonProps?.length) {
      actions = trailingIconButtonProps?.map((props: IconButtonProps, index: number) => (
        <IconButton key={`${props.icon || ''}${index}`} {...props} />
      ))
    }
    if (actions.length) {
      return (
        <Group gap='dense' className={styles.actions}>
          {actions}
        </Group>
      )
    }
  }, [placement, trailingButtonProps, trailingIconButtonProps])

  return (
    <div className={`${styles.container} ${containerClassName} ${backgroundColorClass}`}>
      {iconProps && <Icon variant='filled-secondary' className={'lmnt-theme-secondary-200-bg'} {...iconProps} />}
      <div className={styles.info}>
        <TypoSubtitle level={2}>{primaryText}</TypoSubtitle>
        {secondaryText && <TypoCaption>{secondaryText}</TypoCaption>}
      </div>
      <Actions />
    </div>
  )
}

export default Band
