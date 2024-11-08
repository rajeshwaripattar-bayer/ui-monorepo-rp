import styles from './FloatingButton.module.scss'
import { Button, ButtonProps } from '@element/react-button'

/* eslint-disable-next-line */
export interface FloatingButtonProps extends ButtonProps {}

export function FloatingButton(props: FloatingButtonProps) {
  return <Button className={styles['mobile-floating-btn']} {...props} />
}

export default FloatingButton
