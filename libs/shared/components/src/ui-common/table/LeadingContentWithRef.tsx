import { useState, forwardRef, useImperativeHandle, ReactNode } from 'react'

export interface LeadingContentWithRefProps {
  template: ReactNode
}

export type HandleTemplateUpdate = {
  reRenderLeadingContent: (leadingContentTemplate: ReactNode) => void
}

export const LeadingContentWithRef = forwardRef<HandleTemplateUpdate, LeadingContentWithRefProps>(
  (props: LeadingContentWithRefProps, ref) => {
    const { template } = props
    const [leadingContentTemplate, setLeadingContentTemplate] = useState<ReactNode>(template)
    useImperativeHandle(ref, () => ({
      reRenderLeadingContent: (leadingContentTemplate: ReactNode) => {
        setLeadingContentTemplate(leadingContentTemplate)
      }
    }))
    return leadingContentTemplate
  }
)

export default LeadingContentWithRef
