import styles from './MenuButton.module.scss'
import { Button } from '@element/react-button'
import { IconButton } from '@element/react-icon-button'
import { Icon } from '@element/react-icon'
import { Menu } from '@element/react-menu'
import { List, ListItem } from '@element/react-list'
import { useState } from 'react'

/* eslint-disable-next-line */
export interface MenuButtonProps {
  variant?: string
  buttonLabel?: string
  icon?: string
  listItems: { value: string; label: string; onClick: (a?: object) => void }[]
  data?: object
  leadingIcon?: string
  trailingIcon?: string
}

export function MenuButton(props: MenuButtonProps) {
  const { icon, buttonLabel, listItems, data, leadingIcon, trailingIcon, variant = 'outlined' } = props
  const [open, setOpen] = useState(false)
  const getTrailingIcon = () => (!leadingIcon && !trailingIcon ? 'arrow_drop_down' : trailingIcon)
  return (
    <div className={styles.filter}>
      {icon ? (
        <IconButton onClick={() => setOpen(true)} dense={false}>
          <Icon icon={icon} />
        </IconButton>
      ) : (
        <Button
          variant={variant}
          onClick={() => setOpen(true)}
          leadingIcon={leadingIcon}
          trailingIcon={getTrailingIcon()}
        >
          {buttonLabel || 'More'}
        </Button>
      )}

      <Menu className={styles.container} open={open} surfaceOnly={false} onClose={() => setOpen(false)}>
        <List>
          {listItems.map(({ label, value, onClick }) => (
            <ListItem key={value} value={value} onClick={() => onClick(data)}>
              {label}
            </ListItem>
          ))}
        </List>
      </Menu>
    </div>
  )
}

export default MenuButton
