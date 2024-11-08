import { Icon } from '@element/react-icon'
import { useState } from 'react'
import FloatingButton from './FloatingButton'
import BottomSheet from '../bottom-sheet/BottomSheet'
import { IS_MOBILE } from '@gc/constants'
import MediaQuery from 'react-responsive'
import { List, ListItem } from '@element/react-list'
import styles from './ActionMenuButton.module.scss'
export interface ActionItem {
  value: string
  label: string
  onClick: (data?: object) => void
}
/* eslint-disable-next-line */
export interface ActionMenuButtonProps {
  leadingIcon?: string
  trailingIcon?: string
  buttonLabel?: string
  buttonSize?: string
  menuTitle?: string
  actionItems: Array<ActionItem>
  data?: object
}

export function ActionMenuButton(props: ActionMenuButtonProps) {
  const { leadingIcon, trailingIcon, buttonLabel, buttonSize, menuTitle, actionItems, data } = props
  const [open, setOpen] = useState(false)
  const close = () => {
    setOpen(false)
  }
  const actions = (
    <List>
      {actionItems.map(({ label, value, onClick }) => (
        <ListItem
          className={styles.item}
          key={value}
          value={value}
          onClick={() => {
            setOpen(false)
            onClick(data)
          }}
        >
          {label}
        </ListItem>
      ))}
    </List>
  )

  return (
    <div className={styles.filter}>
      <FloatingButton
        leadingIcon={leadingIcon && <Icon icon={leadingIcon} />}
        trailingIcon={trailingIcon && <Icon icon={trailingIcon} />}
        variant='filled'
        label={buttonLabel ? buttonLabel : 'Actions'}
        buttonSize={buttonSize ? buttonSize : 'xlarge'}
        onClick={() => setOpen(true)}
      />
      <MediaQuery maxWidth={IS_MOBILE}>
        <BottomSheet
          data-testid='action-bottom-sheet'
          title={menuTitle}
          className={styles.bottom_sheet}
          open={open}
          onClose={close}
          detent='content-height'
          content={actions}
          contentScrollable
        />
      </MediaQuery>
    </div>
  )
}

export default ActionMenuButton
