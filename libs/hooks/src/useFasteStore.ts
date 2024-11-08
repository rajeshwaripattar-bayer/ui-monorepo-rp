import { DomainDef, Locale, User, SelectedAccount, AppSessionData, DomainDefGcPortalConfig } from '@gc/types'
import { useFasteStore as useFasteStoreCore } from '@monsantoit/faste-lite-react'
import { useCallback } from 'react'

export function useFetchFasteStore<T>(key: string) {
  const fasteStore = useFasteStoreCore()
  return fasteStore.fetch(key) as T
}

export function usePortalConfig() {
  return useFetchFasteStore<DomainDef>('domainDef')
}

export function useGcPortalConfig(): DomainDefGcPortalConfig
export function useGcPortalConfig<T extends keyof DomainDefGcPortalConfig>(key: T): DomainDefGcPortalConfig[T]
export function useGcPortalConfig<T extends keyof DomainDefGcPortalConfig>(key?: T) {
  const config = usePortalConfig().gcPortalConfig
  return key ? config[key] : config
}

export function useFarmersModuleConfig() {
  return usePortalConfig().farmersModule
}

export function useLocale() {
  return useFetchFasteStore<Locale>('locale')
}

export function useSelectedAccount() {
  return useFetchFasteStore<SelectedAccount>('selectedAccount')
}

export function useUser() {
  return useFetchFasteStore<User>('user')
}

export function useUserEntitlements() {
  const { sapAccountId } = useSelectedAccount()
  const { entitlements } = useUser()
  return entitlements[sapAccountId]
}

export function useAppSessionData() {
  return useFetchFasteStore<AppSessionData>('appSessionData')
}

export function useUpdateFasteStore() {
  const fasteStore = useFasteStoreCore()
  return [fasteStore.update]
}

export function useUpsertAppSessionData() {
  const [updateFaste] = useUpdateFasteStore()
  const appSessionData = useAppSessionData()

  const upsert = useCallback(
    (key: string, value: object) => {
      updateFaste('appSessionData', {
        ...(appSessionData || {}),
        [`${key}`]: {
          ...(appSessionData?.[key] || {}),
          ...value
        }
      })
    },
    [appSessionData, updateFaste]
  )
  return [upsert]
}
