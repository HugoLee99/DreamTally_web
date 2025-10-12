'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { formatExcelDate } from '@/utils/dateUtils';

//MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

const LineChart = () => {
  const [monthlyProfit, setMonthlyProfit] = useState(Array(12).fill(0))
  const [trendLine, setTrendLine] = useState(Array(12).fill(0))
  const [percentChange, setPercentChange] = useState(Array(12).fill(0))
  const [totalProfit, setTotalProfit] = useState(0)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const primaryColor = 'var(--mui-palette-primary-main)'
  const barColor = 'var(--mui-palette-primary-light)'
  const lineColor = 'var(--mui-palette-success-main)'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/transactions')
        const result = await response.json()
        if (result.success && result.data) {
          // 统计每月盈余（按所选年份）
          const profitArr = Array(12).fill(0)
          result.data.forEach(item => {
            const date = formatExcelDate(item.交易时间)
            if (!date) return
            if (date.getFullYear() !== selectedYear) return
            const monthIdx = date.getMonth()
            const amount = parseFloat(item.金额) || 0
            if (item['收/支'] === '收入') {
              profitArr[monthIdx] += amount
            } else if (item['收/支'] === '支出') {
              profitArr[monthIdx] -= amount
            }
          })
          // 保留两位小数
          const profitArrFixed = profitArr.map(v => Number(v.toFixed(2)))
          setMonthlyProfit(profitArrFixed)
          setTotalProfit(Number(profitArrFixed.reduce((a, b) => a + b, 0).toFixed(2)))
          // 计算趋势折线（简单移动平均）
          const trend = profitArrFixed.map((val, idx, arr) => {
            if (idx === 0) return val
            return Number(((arr[idx - 1] + val) / 2).toFixed(2))
          })
          setTrendLine(trend)
          // 计算每月盈余较上月百分比变化
          const percentArr = profitArrFixed.map((val, idx, arr) => {
            if (idx === 0 || arr[idx - 1] === 0) return 0
            return Number((((val - arr[idx - 1]) / Math.abs(arr[idx - 1])) * 100).toFixed(2))
          })
          setPercentChange(percentArr)
        }
      } catch (e) {
        // ignore
      }
    }
    fetchData()
  }, [selectedYear])

  const series = [
    {
      name: '总盈余',
      type: 'column',
      data: monthlyProfit
    },
    {
      name: '趋势分析',
      type: 'line',
      data: trendLine
    },
    {
      name: '盈余变化百分比',
      type: 'line',
      data: percentChange
    }
  ]

  const options = {
    chart: {
      type: 'line',
      parentHeightOffset: 0,
      toolbar: { show: false },
      stacked: false
    },
    tooltip: { enabled: true },
    grid: {
      strokeDashArray: 6,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { top: 10, left: 0, right: 0, bottom: 0 }
    },
    stroke: {
      width: [0, 3],
      curve: 'smooth'
    },
    colors: [barColor, lineColor],
    markers: {
      size: [0, 5],
      colors: [lineColor],
      strokeColors: [lineColor]
    },
    xaxis: {
      categories: months,
      labels: { show: true ,style: { colors: 'var(--mui-palette-text-disabled)' }},
      axisTicks: { show: true },
      axisBorder: { show: true },
    
    },
    yaxis: {
      labels: { show: true ,style: { colors: 'var(--mui-palette-text-disabled)' }},
      title: { text: '盈余金额' },
  
    },
    legend: { show: true, position: 'top',
      labels: {colors:  'var(--mui-palette-text-disabled)'   // 使用主题颜色
      }
     }
  }

  // 自动生成趋势解读
  const trendDesc = (() => {
    if (!trendLine || trendLine.length < 2) return ''
    const first = trendLine[0]
    const last = trendLine[trendLine.length - 1]
    const max = Math.max(...trendLine)
    const min = Math.min(...trendLine)
    let desc = ''
    if (last > first) {
      desc = `本年度盈余整体呈上升趋势，最高值为¥${max.toFixed(2)}，最低值为¥${min.toFixed(2)}`
    } else if (last < first) {
      desc = `本年度盈余整体呈下降趋势，最高值为¥${max.toFixed(2)}，最低值为¥${min.toFixed(2)}`
    } else {
      desc = `本年度盈余整体波动不大，最高值为¥${max.toFixed(2)}，最低值为¥${min.toFixed(2)}`
    }
    return desc
  })()

  // 年份选项（近5年）
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center mb-2'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h3'>¥{totalProfit.toFixed(2)}</Typography>
            <i className='ri-arrow-up-s-line align-bottom text-success'></i>
            
          </div>
          <Typography>{selectedYear}年度盈余</Typography>
        </div>
        <FormControl size='small' sx={{ minWidth: 100 }}>
            <Select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}年</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <AppReactApexCharts 
          type='line' 
          height={220} 
          width='100%' 
          options={options} 
          series={series}
        />
        <Typography color='text.primary' className='font-medium text-center'>
          每月总盈余及趋势分析
        </Typography>
        <Typography color='text.secondary' className='text-center mt-2'>
          {trendDesc}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default LineChart
