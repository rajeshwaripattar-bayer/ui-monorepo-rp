import { seedsmanPortalConfig } from '@gc/shared/env'
import { updateStore } from '@gc/utils'

import FASTE from './fasteBootstrap'

const wrappedMount = FASTE.mount

FASTE.mount = async (elementID: string, moduleProps: object) => {
  wrappedMount(elementID, moduleProps)
  updateStore('domainDef', seedsmanPortalConfig)
}

export default FASTE
