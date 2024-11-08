import { Switch } from '@element/react-switch'
import { TypoCaption } from '@element/react-typography'
import styles from './SelectAllSwitch.module.scss'

export interface SelectAllSwitchProps {
  checked: boolean
  label?: string
  setChecked: (val: boolean) => void
}

function SelectAllComponent({ checked, label, setChecked }: Readonly<SelectAllSwitchProps>) {
  return (
    <div className={styles.select_all_item}>
      <TypoCaption>{label ?? ''}</TypoCaption>

      <span className={styles.switch}>
        <Switch
          label={''}
          checked={checked}
          themeColor={'primary'}
          data-testid='select-all-switch'
          style={{ marginLeft: 'auto' }}
          onChange={(val: boolean) => {
            setChecked(val)
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        />
      </span>
    </div>
  )
}

export default SelectAllComponent
