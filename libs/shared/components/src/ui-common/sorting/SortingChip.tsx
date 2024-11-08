import styles from './SortingChip.module.scss'
import { Chip } from '@element/react-chips'
import { Icon } from '@element/react-icon'
import { Radio } from '@element/react-radio'
import { useState, ReactNode } from 'react'
import { TypoCaption } from '@element/react-typography'
import BottomSheet from '../bottom-sheet/BottomSheet'

const BG_COLOR = 'rgba(0, 108, 103, 0.3)'
const FONT_COLOR = 'rgba(0, 108, 103, 1)'

export interface sortingList {
  label: string
  columnName: string
  sortingType: string
}

export interface SortingChipProps {
  sortingList: Array<sortingList>
  chipValue: string
  chipLabel: string
  leadingIcon?: string
  handleSortChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SortingChip(props: SortingChipProps) {
  const [chipValue, setChipValue] = useState(props.chipValue)
  const [open, setOpen] = useState(false)
  const [chipLabel, setChipLabel] = useState<string | ReactNode>(props.chipLabel)
  const [chipBgColor, setChipBgColor] = useState('')
  const [chipFontColor, setChipFontColor] = useState(FONT_COLOR)

  const clearFocus = () => {
    const chip = document.activeElement as HTMLElement
    if (chip) chip.blur()
  }

  const close = () => {
    setOpen(false)
    clearFocus()
    setChipBgColor('')
  }

  const handleChipClick = () => {
    setOpen(true)
    setChipBgColor(BG_COLOR)
  }

  const handleSortingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChipValue(event.target.value)
    setChipLabel(event.target.getAttribute('data'))
    props.handleSortChange(event)
    setOpen(false)
    setChipBgColor('')
  }

  const leadingIcon = () =>
    props.leadingIcon && <Icon icon={props.leadingIcon} iconSize='small' style={{ marginRight: '4px' }} />

  const chipStyles = {
    color: chipFontColor,
    backgroundColor: chipBgColor,
    verticalAlign: 'middle',
    lineHeight: '16px',
    padding: '0px 10px'
  }

  const sortingContent = (
    <>
      {props.sortingList.map((item: sortingList) => {
        return (
          <div key={item.label} className={styles.checkbox_list}>
            <Radio
              key={`radio-${item.label}`}
              label={item.label}
              value={`${item.columnName}-${item.sortingType}`}
              data={item.label}
              checked={chipValue === `${item.columnName}-${item.sortingType}`}
              onChange={handleSortingChange}
              name='sort'
            />
          </div>
        )
      })}
    </>
  )

  return (
    <div className={styles.filter}>
      <Chip
        data-testid={props.chipLabel}
        labelRenderer={() => <TypoCaption style={{ fontWeight: 700 }}>{chipLabel}</TypoCaption>}
        variant='outlined'
        leadingIcon={leadingIcon}
        onClick={handleChipClick}
        style={chipStyles}
        initiallySelected={true}
        selected={false}
        chipData={{}}
        input={false}
      />
      <BottomSheet
        data-testid='filter-bottom-sheet'
        title='Sort'
        className={styles.bottom_sheet}
        open={open}
        onClose={close}
        detent='content-height'
        content={sortingContent}
      />
    </div>
  )
}

export default SortingChip
