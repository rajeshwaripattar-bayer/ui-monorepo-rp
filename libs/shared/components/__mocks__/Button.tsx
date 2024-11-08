import React from 'react'
import { ButtonProps } from '@element/react-button'
Object.defineProperty(exports, '__esModule', { value: true })

const Button = (props: ButtonProps) => {
  return (
    <button id='testButton' onClick={() => props.onClick?.()}>
      {JSON.stringify(props)}
    </button>
  )
}

exports.Button = Button
