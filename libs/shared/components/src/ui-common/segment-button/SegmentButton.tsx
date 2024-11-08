import { useCallback, useState } from 'react'
import styles from './SegmentButton.module.scss'
import { Button, ButtonProps } from '@element/react-button'
import { Group } from '@element/react-group'

export interface SegmentButton {
  name: string
  value: string
}

export interface SegmentButtonProps {
  buttonProps?: ButtonProps & React.HTMLProps<HTMLElement>
  data: SegmentButton[]
  selectedValue?: string
  onClick?: (selectedValue: string) => void
}

export function SegmentButton(props: Readonly<SegmentButtonProps>) {
  const [active, setActive] = useState(props.selectedValue)

  const handleClick = useCallback(
    (selectedValue: string) => {
      setActive(selectedValue)
      props.onClick && props.onClick(selectedValue)
    },
    [props]
  )

  const buttons = props.data.map((button: SegmentButton) => (
    <Button
      {...props.buttonProps}
      label={button.name}
      key={button.name}
      variant={button.value === active ? 'filled' : 'outlined'}
      onClick={() => handleClick(button.value)}
    />
  ))

  return (
    <Group className={styles['container']} gap='none'>
      {buttons}
    </Group>
  )
}

export default SegmentButton
