export const hasEntitlement = (entitlements: string[], partial: string) => {
  return entitlements.some((e) => e.includes(partial))
}

export const hasAnyEntitlement = (entitlements: string[], partials: string[] = []) => {
  return partials.some((partial) => hasEntitlement(entitlements, partial))
}

export const hasNbmEntitlement = (entitlements: string[], lob: string) => {
  return hasEntitlement(entitlements, `${lob}:nbm:`)
}

export const hasNbmProgramEntitlement = (entitlements: string[], lob: string, programName: string) => {
  return hasEntitlement(entitlements, `${lob}:nbm:${programName}`)
}
