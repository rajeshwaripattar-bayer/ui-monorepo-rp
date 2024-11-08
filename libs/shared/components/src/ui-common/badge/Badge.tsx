import { LabelBadge } from '@element/react-badge'
import { ColorConfig } from '@gc/types'
import { useGcPortalConfig } from '@gc/hooks'

/*
  This is a wrapper component for the elements Badge component.
  Props:
     labelText - text to be displayed on the badge
     themeColor (optional) - takes in acceptable values for elements badge themeColor

  The themeColor passed in as prop takes top precedence.
  If not passed, this component determines the appropriate themeColor
  based on the labelText passed in & configuration setup in portal parameters.
  Default is gray.

  Note:- Color Configuration needs to be set up in Portal Config as text/color object array.
  Sample:
        badgeThemeColor : [
          {
            "color" : "green",
            "text" : ["Success", "Confirmed"]
          },
          {
            "color" : "red",
            "text" : ["Failure", "Error"]
          }
        ]
*/

/* eslint-disable-next-line */
export interface BadgeProps {
  labelText: string
  themeColor?: string
  className?: string
}

export function Badge(props: BadgeProps) {
  const { uiCommon } = useGcPortalConfig() //Fetch portal config
  const badgeThemeColor = uiCommon?.badgeThemeColor

  //Find the color configuration based on the input label text.
  // const theme = badgeThemeColor?.find((config: ColorConfig) => config.text.includes(props.labelText))
  const theme = badgeThemeColor?.find((config: ColorConfig) =>
    config.text.some((text) => props.labelText.startsWith(text))
  )

  //theme color from input property takes precedence, then from the configuration, if still indeterminate, default is gray
  const themeColor = props.themeColor || theme?.color || 'gray' // Defaulting to gray
  const backgroundColorStyle = themeColor.startsWith('#') ? { backgroundColor: themeColor } : {}

  return (
    <LabelBadge
      style={backgroundColorStyle}
      label={props.labelText}
      labelType='string'
      themeColor={themeColor}
      className={props?.className}
    />
  )
}

export default Badge
