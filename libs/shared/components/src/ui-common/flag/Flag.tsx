import styles from './Flag.module.scss'
import React from 'react'

type FlagProps = {
  className?: string
}

export function Flag({ className }: FlagProps) {
  return <div className={`${styles.container} ${className}`} />
}

export default Flag
