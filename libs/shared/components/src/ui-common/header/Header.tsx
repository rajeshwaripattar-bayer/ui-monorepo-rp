/* eslint-disable @nx/enforce-module-boundaries */

import styles from './Header.module.scss'
import { TypoDisplay, TypoBody, TypoCaption } from '@element/react-typography'
import { Button, ButtonProps } from '@element/react-button'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP, resolutions } from '@gc/constants'
import { Badge } from '../badge/Badge'
import { getTypoDisplayLevel } from '@gc/utils'
import { useScreenRes } from '@gc/hooks'
import { Group } from '@element/react-group'
import MenuButton, { MenuButtonProps } from '../button/MenuButton'

/* eslint-disable-next-line */
export interface HeaderProps {
  overlineText?: string
  title: string
  secText1?: string
  secText2?: string
  buttonProps?: ButtonProps[]
  inEditMode?: boolean
  moreActions?: MenuButtonProps & { isPrimary?: boolean }
}

export function Header(props: Readonly<HeaderProps>) {
  const res: number = useScreenRes()
  const typoDisplayLevel = getTypoDisplayLevel(res)
  const getCaption = () => {
    return (
      (props?.secText1 ? props.secText1 : '') +
      (props?.secText1 && props.secText2 ? '  •  ' : '') +
      (props?.secText2 ? props.secText2 : '')
    )
  }

  const buttons = props.buttonProps
    ? props.buttonProps.map((buttonProps) => {
        return <Button {...buttonProps} key={buttonProps.label} fullWidth={res <= resolutions.M719}></Button>
      })
    : null

  const HeaderTitle = () => (
    <div className={styles.header_main}>
      {props.overlineText && <Badge labelText={props.overlineText || ''} />}
      <TypoDisplay level={typoDisplayLevel}>{props.title}</TypoDisplay>
      {res <= resolutions.M719 ? (
        <>
          <TypoBody level={2}>{props?.secText1 && <TypoCaption> {props.secText1}</TypoCaption>}</TypoBody>
          <TypoBody level={2}>{props?.secText2 && <TypoCaption>{props.secText2}</TypoCaption>}</TypoBody>
        </>
      ) : res <= resolutions.M1023 ? (
        <TypoBody level={2}>{getCaption()}</TypoBody>
      ) : (
        !props.inEditMode && <TypoBody level={2}>{getCaption()}</TypoBody>
      )}
    </div>
  )

  return (
    <div className={styles.container}>
      <MediaQuery maxWidth={IS_MOBILE}>
        <HeaderTitle />
        {res <= resolutions.M719 ? (
          <Group className={styles.buttonGroup} gap='dense' direction='vertical'>
            {buttons}
          </Group>
        ) : (
          <Group className={styles.buttonGroup} gap='dense' direction='horizontal'>
            {buttons}
          </Group>
        )}
      </MediaQuery>
      <MediaQuery minWidth={IS_DESKTOP}>
        <HeaderTitle />
        {!props.inEditMode && (
          <div className={styles.desktopButtonGroup}>
            <Group gap='dense' direction='horizontal'>
              {props.moreActions && !props.moreActions?.isPrimary && <MenuButton {...props.moreActions} />}
              {buttons}
              {props.moreActions && props.moreActions?.isPrimary && (
                <MenuButton variant='filled' {...props.moreActions} />
              )}
            </Group>
          </div>
        )}
      </MediaQuery>
    </div>
  )
}

export default Header
