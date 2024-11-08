import { Padding } from '@element/react-padding'
import { Tab, TabBar } from '@element/react-tabs'
import { LicensedGrowerTotals, LicensedUnitTotals, WidgetConfig } from '@gc/types'
import React, { useState } from 'react'
import { Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import TableMessage from './TableMessage'

const renderChart = (
  chartData: { value: number }[],
  colors: string[],
  totalLabel: string,
  isError: boolean,
  refetch: () => void
) => {
  const isEmptyData = chartData.every((data) => data.value === 0)
  if (isError || isEmptyData) {
    return <TableMessage loading={false} error={isError} refetch={refetch} />
  }
  return (
    <ResponsiveContainer width='100%' height={350}>
      <PieChart>
        <Pie data={chartData} labelLine={false} innerRadius={80} outerRadius={120} fill='#8884d8' dataKey='value'>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
          <Label
            value={totalLabel}
            position='center'
            style={{
              fontSize: '14px',
              textAnchor: 'middle'
            }}
          />
        </Pie>
        <Tooltip />
        <Legend verticalAlign='bottom' height={36} />
      </PieChart>
    </ResponsiveContainer>
  )
}

type LicenseStatusChartProps = {
  farmersData?: LicensedGrowerTotals
  unitsData?: LicensedUnitTotals
  tabs?: WidgetConfig['tabs']
  isError?: boolean
  refetch: () => void
}

export const LicenseStatusChart = ({
  farmersData,
  unitsData,
  tabs = [],
  isError = false,
  refetch
}: LicenseStatusChartProps) => {
  const [currentTab, setCurrentTab] = useState(0)
  const tabUsage = tabs[currentTab]?.usage || ''
  const tabColors = tabs[currentTab]?.colors || []
  const handleTabActivated = (index: number) => {
    setCurrentTab(index)
  }

  const farmerChartData = [
    { name: 'LICENSED', value: farmersData?.licensedPeople || 0 },
    { name: 'NOT LICENSED', value: farmersData?.unLicensedPeople || 0 },
    { name: 'UNAUTHORIZED', value: farmersData?.unauthorizedPeople || 0 }
  ]
  const totalFarmersLabel = `Total: ${farmersData?.totalFarmers || 0}`

  const unitChartData = [
    { name: 'LICENSED', value: unitsData?.licensedUnit || 0 },
    { name: 'NOT LICENSED', value: unitsData?.unLicensedUnit || 0 },
    { name: 'UNAUTHORIZED', value: unitsData?.unauthorizedUnit || 0 }
  ]
  const totalUnitsLabel = `Total Units: ${unitsData?.totalUnits || 0}`

  const chartData = tabUsage === 'unitsChart' ? unitChartData : farmerChartData
  const totalLabel = tabUsage === 'unitsChart' ? totalUnitsLabel : totalFarmersLabel

  return (
    <>
      <TabBar activeTabIndex={currentTab} onTabActivated={handleTabActivated}>
        {tabs.map((tab) => {
          return <Tab key={tab.title}>{tab.title}</Tab>
        })}
      </TabBar>
      <Padding>
        <div>{renderChart(chartData, tabColors, totalLabel, isError, refetch)}</div>
      </Padding>
    </>
  )
}

export default LicenseStatusChart
