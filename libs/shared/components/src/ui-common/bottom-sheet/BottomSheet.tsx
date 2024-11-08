import styles from './BottomSheet.module.scss'
import {
  BottomSheet as ElementBottomSheet,
  BottomSheetHeader,
  BottomSheetContent,
  BottomSheetProps as ElementBottomSheetProps
} from '@element/react-bottom-sheet'
import { Divider } from '@element/react-divider'
import { ReactNode } from 'react'

/* eslint-disable-next-line */
export interface BottomSheetProps extends ElementBottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  contentScrollable?: boolean
  content: ReactNode
  footer?: ReactNode
}

export function BottomSheet(props: BottomSheetProps) {
  const { title, contentScrollable = false, className = '', ...rest } = props
  return (
    <ElementBottomSheet {...rest} className={`${className} ${styles.container}`}>
      {title && <BottomSheetHeader>{title}</BottomSheetHeader>}
      {title && <Divider />}
      <BottomSheetContent scrollable={contentScrollable}>{props.content}</BottomSheetContent>
      {props.footer && (
        <div data-testid='footer'>
          <Divider />
          <div className={styles.footer}>{props.footer}</div>
        </div>
      )}
    </ElementBottomSheet>
  )
}

export default BottomSheet
