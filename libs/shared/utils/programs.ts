import { FvProgram, NbmProgram, Program } from '@gc/types'

export const findNbmProgramByCompositeKey = (nbmProgram: NbmProgram, nbmPrograms: NbmProgram[]) => {
  return nbmPrograms.find(
    (prg) => prg.programId === nbmProgram.programId && prg.year === nbmProgram.year && prg.brand === nbmProgram.brand
  )
}

export const findFvProgramByCompositeKey = (nbmProgram: NbmProgram, fieldViewPrograms: FvProgram[]) => {
  return fieldViewPrograms.find(
    (fvPrg) =>
      (nbmProgram.programId === fvPrg.externalIdentity.id &&
        nbmProgram.year === fvPrg.temporalPeriod.programYear &&
        !nbmProgram.brand) ||
      fvPrg.configuration.challengerSeedBrands.some((fvBrand) => nbmProgram.brand === fvBrand.name.toLowerCase())
  )
}

export const mergePrograms = (nbmPrograms: NbmProgram[], fieldViewPrograms: FvProgram[]) => {
  return nbmPrograms.map((nbmProgram) => {
    const fieldViewProgram = findFvProgramByCompositeKey(nbmProgram, fieldViewPrograms)
    return {
      ...nbmProgram,
      fieldViewProgram: {
        ...fieldViewProgram
      }
    }
  }) as Program[]
}

export const enrollmentStatusMapper: { [key: string]: 'Available' | 'Accepted' | 'Enrolled' } = {
  AVAILABLE: 'Available',
  NOMINATED: 'Accepted',
  ENROLLED: 'Enrolled'
}
