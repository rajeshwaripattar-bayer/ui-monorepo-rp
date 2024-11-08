import styles from './SearchBarMobile.module.scss'
import { Textfield } from '@element/react-textfield'
import { GridRow, GridCol } from '@element/react-grid'
import { Button } from '@element/react-button'
import { Icon } from '@element/react-icon'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@element/react-icon-button'
import { useState } from 'react'

/* eslint-disable-next-line */
export interface SearchBarMobileProps {
  searchTerm?: string
  actionProps?: {
    icon: string
    disabled?: boolean
    onClick: () => void
  }
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (e: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void
}

export function SearchBarMobile(props: SearchBarMobileProps) {
  const { t } = useTranslation()
  const { searchTerm, onChange, onClick } = props
  const [inFocus, setInFocus] = useState(false)
  const iconVariant = inFocus ? 'color-primary' : 'secondary-on-surface'

  return (
    <GridRow className={props.className ? `${styles[props.className]} ${styles.container}` : styles.container}>
      <GridCol
        className={styles['searchBar']}
        desktopCol={9}
        tabletCol={6}
        phoneCol={3}
        horizontalAlign='left'
        verticalAlign='middle'
        align='middle'
      >
        <Textfield
          className={styles['search']}
          variant='embedded'
          leadingIcon={<Icon icon='search' iconSize={'medium'} variant={iconVariant} />}
          value={searchTerm}
          label={t('common.search.label')}
          dense
          autoFocus
          onChange={(event) => onChange(event)}
          trailingIcon={
            searchTerm ? (
              <IconButton onClick={(event) => onClick(event)} icon='close' className={styles['close_icon']} />
            ) : null
          }
          onFocus={() => {
            setInFocus(true)
          }}
          onBlur={() => {
            setInFocus(false)
          }}
        />
      </GridCol>
      <GridCol desktopCol={3} tabletCol={2} phoneCol={1} horizontalAlign='right' verticalAlign='middle' align='middle'>
        <Button variant='text' onClick={props.actionProps?.onClick}>
          {t('common.close.label')}
        </Button>
      </GridCol>
    </GridRow>
  )
}

export default SearchBarMobile
