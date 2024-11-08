import styles from './TableMenu.module.scss'
import { Menu } from '@element/react-menu'
import { List, ListItem } from '@element/react-list'
import { Icon } from '@element/react-icon'
import { IconButton } from '@element/react-icon-button'
import { useState } from 'react'

export type TableMenuListItem = { value: string; label: string; onClick: () => void }
// T is the type of table data
export interface TableMenuProps<T> {
  triggerIcon?: string
  listItems: { value: string; label: string; onClick: (selectedData: T) => void }[]
  currentRow: T
}

export function TableMenu<T>(props: TableMenuProps<T>) {
  const { listItems, currentRow, triggerIcon } = props
  const [isOpen, setIsOpen] = useState(false)

  const CustomMenuTrigger = () => {
    return (
      <IconButton
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <Icon icon={triggerIcon || 'more_horiz'} />
      </IconButton>
    )
  }

  return (
    <Menu
      className={styles.menu}
      trigger={<CustomMenuTrigger />}
      anchorCorner='BOTTOM_LEFT'
      anchorMargin={{ left: 40 }}
      hoistToBody
      open={isOpen}
      onClose={() => {
        setIsOpen(false)
      }}
    >
      <List>
        {listItems.map(({ label, value, onClick }) => (
          <ListItem key={value} value={value} onClick={() => onClick(currentRow)}>
            {label}
          </ListItem>
        ))}
      </List>
    </Menu>
  )
}

export default TableMenu
