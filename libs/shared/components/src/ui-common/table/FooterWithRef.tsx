import { useState, forwardRef, useImperativeHandle, ReactNode } from 'react'

export interface FooterWithRefProps {
  template: ReactNode
}

export type HandleTemplateUpdate = {
  reRenderFooter: (footerTemplate: ReactNode) => void
}

export const FooterWithRef = forwardRef<HandleTemplateUpdate, FooterWithRefProps>((props: FooterWithRefProps, ref) => {
  const { template } = props
  const [footerTemplate, setFooterTemplate] = useState<ReactNode>(template)
  useImperativeHandle(ref, () => ({
    reRenderFooter: (footerTemplate: ReactNode) => {
      setFooterTemplate(footerTemplate)
    }
  }))
  return footerTemplate
})

export default FooterWithRef
