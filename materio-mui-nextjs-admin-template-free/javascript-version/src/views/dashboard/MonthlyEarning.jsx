'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars
const chartData = [
  { name: 'United States', value: 8656, color: '#28C76F' },
  { name: 'United Kingdom', value: 2415, color: '#EA5455' },
  { name: 'India', value: 865, color: '#FF9F43' },
  { name: 'Japan', value: 745, color: '#9C27B0' },
  { name: 'Korea', value: 45, color: '#EA5455' }
]

const legendData = [
  {
    avatarLabel: 'US',
    avatarColor: 'success',
    title: '$8,656k',
    subtitle: 'United states of america',
    sales: '894k',
    trend: 'up',
    trendPercentage: '25.8%'
  },
  {
    avatarLabel: 'UK',
    avatarColor: 'error',
    title: '$2,415k',
    subtitle: 'United kingdom',
    sales: '645k',
    trend: 'down',
    trendPercentage: '6.2%'
  },
  {
    avatarLabel: 'IN',
    avatarColor: 'warning',
    title: '$865k',
    subtitle: 'India',
    sales: '148k',
    trend: 'up',
    trendPercentage: '12.4%'
  },
  {
    avatarLabel: 'JA',
    avatarColor: 'secondary',
    title: '$745k',
    subtitle: 'Japan',
    sales: '86k',
    trend: 'down',
    trendPercentage: '11.9%'
  },
  {
    avatarLabel: 'KO',
    avatarColor: 'error',
    title: '$45k',
    subtitle: 'Korea',
    sales: '42k',
    trend: 'up',
    trendPercentage: '16.2%'
  }
]

const MonthlyEarning = () => {
  // Hooks
  const theme = useTheme()

  // Vars
  const series = chartData.map(item => item.value)
  const labels = chartData.map(item => item.name)
  const colors = chartData.map(item => item.color)

  const options = {
    chart: {
      type: 'pie',
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    labels: labels,
    colors: colors,
    stroke: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val + 'k'
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--mui-palette-text-primary)',
              offsetY: 20
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--mui-palette-text-primary)',
              offsetY: -20,
              formatter: function (val) {
                return '$' + val + 'k'
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Sales',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--mui-palette-text-primary)',
              formatter: function (w) {
                return '$' + w.globals.seriesTotals.reduce((a, b) => a + b, 0).toFixed(0) + 'k'
              }
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: 300
          }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader
        title='本月收入'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      />
      <CardContent>
        <div className='flex flex-col gap-6'>
          {/* Pie Chart */}
          <div className='flex justify-center'>
            <AppReactApexCharts 
              type='pie' 
              height={280} 
              width='100%' 
              options={options} 
              series={series} 
            />
          </div>
          
          {/* Legend */}
          {/* <div className='flex flex-col gap-[0.875rem]'>
            {legendData.map((item, index) => (
              <div key={index} className='flex items-center gap-4'>
                <CustomAvatar skin='light' color={item.avatarColor}>
                  {item.avatarLabel}
                </CustomAvatar>
                <div className='flex items-center justify-between is-full flex-wrap gap-x-4 gap-y-2'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.title}
                      </Typography>
                      <div className={'flex items-center gap-1'}>
                        <i
                          className={classnames(
                            item.trend === 'up' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line',
                            item.trend === 'up' ? 'text-success' : 'text-error'
                          )}
                        ></i>
                        <Typography color={item.trend === 'up' ? 'success.main' : 'error.main'}>
                          {item.trendPercentage}
                        </Typography>
                      </div>
                    </div>
                    <Typography>{item.subtitle}</Typography>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.sales}
                    </Typography>
                    <Typography variant='body2' color='text.disabled'>
                      Sales
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthlyEarning
