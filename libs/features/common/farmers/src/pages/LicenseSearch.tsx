import { Button } from '@element/react-button'
import { Grid, GridCol, GridRow } from '@element/react-grid'
import { TypoDisplay } from '@element/react-typography'
import { HeaderType, Loading, MessageWithAction, Table } from '@gc/components'
import { useFarmersModuleConfig } from '@gc/hooks'
import { SearchForm } from '@gc/rtk-queries'
import { Account, FormConfig } from '@gc/types'
import groupBy from 'lodash/groupBy'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { BackButton, InputFields, LicenseSearchAck } from '../components'
import { useLazySearchAccountsQuery } from '../store'
import styles from './LicenseSearch.module.scss'

export const LicenseSearch = () => {
  const { licenseFormConfig, licenseFarmersTableColumns } = useFarmersModuleConfig()
  const [initialFormValues, groupedLicenseFormConfig] = useMemo(() => {
    return [
      licenseFormConfig.reduce((form, config) => (config.value ? { ...form, [config.id]: config.value } : form), {}),
      groupBy(licenseFormConfig, 'group')
    ]
  }, [licenseFormConfig])

  const [formValues, setFormValues] = useState<SearchForm>(initialFormValues)
  const [intialLoad, setIntialLoad] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isSearchLoading, setSearchLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [getFarmers, { isLoading: isFarmersLoading, isError: isFarmersError, isFetching: isFarrmersFetching }] =
    useLazySearchAccountsQuery(formValues)

  const isFormComplete = useCallback(() => {
    return Object.values(formValues).filter((value) => !!value).length > Object.values(initialFormValues).length
  }, [formValues, initialFormValues])

  const validateFieldValue = useCallback((fieldConfig: FormConfig, value: string) => {
    if (!value || !fieldConfig.checkValidation || !fieldConfig.validationRule) return true
    const validationRegex = new RegExp(fieldConfig.validationRule)
    return validationRegex.test(value)
  }, [])

  const validateFormValues = useCallback(() => {
    for (const field of licenseFormConfig) {
      const value = formValues[field.id] as string
      if (value && field.validationRule && field.checkValidation) {
        const validationRegex = new RegExp(field.validationRule)
        if (!validationRegex.test(value)) return false
      }
    }
    return true
  }, [licenseFormConfig, formValues])

  const onChangeFormValue = (key: string, value: string) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [key]: value
    }))
  }

  const onClickSearch = () => {
    setIntialLoad(false)
    setSearchLoading(true)
    getFarmers({
      formValues,
      updatePartial: async (accounts: Account[]) => setAccounts(accounts)
    }).then(() => {
      setTimeout(() => {
        setSearchLoading(false)
      }, 500)
    })
  }

  const licenseSearchHeaders = licenseFarmersTableColumns.map((c) => {
    const column = { ...c } as HeaderType<Account>
    if (column.displayType === 'link') {
      column.onLinkClick = (account: Account) => {
        navigate('/farmer-info', { state: { farmer: account } })
      }
    }
    return column
  })

  const getMessageContent = () => {
    return (
      <MessageWithAction
        messageHeader={t('farmers_api_error_header_msg')}
        messageDescription={t('farmer.api_error_description_msg')}
        primaryButtonProps={{ label: t('common.try_again.label'), variant: 'text', onClick: getFarmers }}
        iconProps={{
          icon: 'info_outline',
          variant: 'filled-secondary',
          className: 'lmnt-theme-secondary-200-bg'
        }}
      />
    )
  }

  return (
    <Grid className={styles.licenseSearchContainer}>
      <GridRow>
        <LicenseSearchAck />
      </GridRow>
      <GridRow className={styles.headerRow}>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <BackButton />
        </GridCol>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <TypoDisplay level={3}>{t('farmers.tables.licenseSearch.pageTitle')}</TypoDisplay>
        </GridCol>
      </GridRow>
      <form>
        {Object.entries(groupedLicenseFormConfig).map(([groupName, groupItems], groupIndex) => (
          <GridRow key={groupName} className={styles.licenseSearchFormRow}>
            {groupItems.map((item, fieldIndex) => {
              const value = formValues[item.id]
              const isValid = validateFieldValue(item, value)
              return (
                <GridCol
                  key={item.id}
                  className={styles.licenseSearchFormCol}
                  desktopCol={Math.round(12 / groupItems.length)}
                  tabletCol={8}
                  phoneCol={4}
                >
                  <InputFields
                    label={item.label}
                    value={value}
                    field={item.id}
                    type={item.type}
                    onChangeHandler={onChangeFormValue}
                    disabled={item.disabled}
                    autoFocus={!groupIndex && !fieldIndex}
                    options={item.options}
                    validationMessage={item.validationMessage}
                    isValid={isValid}
                  />
                </GridCol>
              )
            })}
          </GridRow>
        ))}
        <GridRow>
          <GridCol>
            <Button
              label='clear'
              variant='outlined'
              fullWidth={true}
              buttonSize='xlarge'
              onClick={() => {
                setFormValues(initialFormValues)
                setIntialLoad(true)
              }}
            />
          </GridCol>
          <GridCol>
            <Button
              label='search'
              variant='outlined'
              fullWidth={true}
              buttonSize='xlarge'
              type='submit'
              disabled={isFarmersLoading || isSearchLoading || !isFormComplete() || !validateFormValues()}
              onClick={onClickSearch}
            />
          </GridCol>
        </GridRow>
      </form>

      {!intialLoad && !isFarrmersFetching && (
        <GridRow style={{ marginTop: 50 }}>
          <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
            <Table<Account>
              title={'FARMERS'}
              data={accounts}
              headers={licenseSearchHeaders as HeaderType<Account>[]}
              searchable
              paginated
              noContentMessage={
                <MessageWithAction
                  messageHeader={t('common.no_results_message_header_label')}
                  messageDescription={t('common.no_results_message_description')}
                  iconProps={{
                    icon: 'info_outline',
                    variant: 'filled-secondary',
                    className: 'lmnt-theme-secondary-200-bg'
                  }}
                />
              }
            />
          </GridCol>
        </GridRow>
      )}
      <GridCol
        desktopCol={12}
        tabletCol={8}
        phoneCol={4}
        className={styles.container_contingency}
        verticalAlign='middle'
      >
        {isFarmersLoading || isSearchLoading || isFarrmersFetching ? (
          <Loading label={t('common.loading_farmers_message.label')} />
        ) : (
          ''
        )}
        {isFarmersError ? getMessageContent() : ''}
      </GridCol>
    </Grid>
  )
}

export default LicenseSearch
