import { Button } from '@element/react-button'
import { Modal } from '@element/react-modal'
import { Typography } from '@element/react-typography'
import { useUser } from '@gc/hooks'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LicenseSearchAck = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { username = '' } = useUser()

  useEffect(() => {
    const licAckObj = sessionStorage.getItem('licAck')
    const licAck = licAckObj ? JSON.parse(licAckObj) : {}
    if (!licAck || !licAck?.[username]) {
      setOpen(true)
    }
  }, [username])

  const handleOnClickAgree = () => {
    sessionStorage.setItem('licAck', JSON.stringify({ [username]: true }))
    setOpen(false)
  }

  const handleOnClickNotAgree = () => {
    setOpen(false)
    navigate('/')
  }

  return (
    <Modal
      title='License Agreement'
      modalSize='large'
      hideCloseIcon={true}
      preventClose={true}
      open={open}
      dismissiveButton={<Button onClick={handleOnClickNotAgree}>I DO NOT AGREE</Button>}
      primaryButton={<Button onClick={handleOnClickAgree}>I AGREE</Button>}
    >
      <div>
        <Typography type='body1' tag='p'>
          Unless otherwise expressly authorized by Bayer CropScience LP (“Bayer”), seed containing Bayer’s patented
          traits (&quot;Traited Seed&quot;) may be sold only to growers who have completed, signed and submitted a
          Technology Stewardship Agreement (TSA) for which Bayer has issued a grower license and Technology ID.In
          addition, you may not sell or offer to sell Traited Seed to a grower whose license status is Unauthorized,
          Unlicensed, Permanent Injunction, or Delicensed in the grower licensing database. By clicking &quot;I
          Agree&quot;, you acknowledge that you understand these obligations and confirm you will not sell or offer for
          sale any Traited Seed to any grower on the Unauthorized Grower List.
        </Typography>
      </div>
    </Modal>
  )
}

export default LicenseSearchAck
