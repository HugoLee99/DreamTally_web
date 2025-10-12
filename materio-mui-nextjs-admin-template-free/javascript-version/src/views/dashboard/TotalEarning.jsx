'use client';
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import { useDateContext } from '@/contexts/DateContext';
import { formatExcelDate } from '@/utils/dateUtils';
// 来源图标和颜色映射
const sourceConfig = {
  '支付宝': {
    color: 'info',
    imgSrc: '/images/logos/alipay.png'
  },
  '微信': {
    color: 'success',
    imgSrc: '/images/logos/wechat.png'
  },
  '银行 APP': {
    color: 'primary',
    imgSrc: '/images/logos/bank.png'
  },
  '其他': {
    color: 'secondary',
    imgSrc: '/images/logos/cash.png'
  }
}

const TotalEarning = () => {
  const [data, setData] = useState([])
  const [totalDeposit, setTotalDeposit] = useState(0)
  const [lastMonthDeposit, setLastMonthDeposit] = useState(0)
  const [growthPercent, setGrowthPercent] = useState(0)
  const [loading, setLoading] = useState(true)
  const { selectedYear, selectedMonth } = useDateContext();

  useEffect(() => {
    const fetchSourceStats = async () => {
      try {
        const response = await fetch('/api/transactions')
        const result = await response.json()
        if (result.success && result.data) {
          // 筛选所选年月和上个月数据
          const thisMonthData = result.data.filter(item => {
            const date = formatExcelDate(item['交易时间'])
            return date && date.getFullYear() === selectedYear && (date.getMonth() + 1) === selectedMonth
          })
          let lastMonth = selectedMonth - 1
          let lastYear = selectedYear
          if (lastMonth === 0) {
            lastMonth = 12
            lastYear = selectedYear - 1
          }
          const lastMonthData = result.data.filter(item => {
            const date = formatExcelDate(item['交易时间'])
            return date && date.getFullYear() === lastYear && (date.getMonth() + 1) === lastMonth
          })

          // 计算本月收入和支出
          let totalIncome = 0
            let totalExpense = 0
            const incomeStats = {}
            const expenseStats = {}
            thisMonthData.forEach(item => {
              const source = item.来源 || '其他'
              console.log('item.金额:', item.金额)
              console.log('source:', source)
            
              const amount = parseFloat(item.金额) || 0
              if (item['收/支'] === '收入') {
                totalIncome += amount
                incomeStats[source] = (incomeStats[source] || 0) + amount
              } else if (item['收/支'] === '支出') {
                totalExpense += amount // 支出直接累加为正数
                expenseStats[source] = (expenseStats[source] || 0) + amount
              }
            })
            const totalDeposit = totalIncome - totalExpense // 存款=收入-支出
            setTotalDeposit(totalDeposit)

          // 计算上月收入和支出
          let lastIncome = 0
          let lastExpense = 0
          lastMonthData.forEach(item => {
            const amount = parseFloat(item.乘后金额) || 0
            if (item['收/支'] === '收入') {
              lastIncome += amount
            } else if (item['收/支'] === '支出') {
              lastExpense += amount // 支出直接累加为正数
            }
          })
          const lastDeposit = lastIncome - lastExpense
          setLastMonthDeposit(lastDeposit)

          // 计算增长比例
          let percent = 0
          if (lastDeposit !== 0) {
            percent = ((totalDeposit - lastDeposit) / Math.abs(lastDeposit)) * 100
          } else if (totalDeposit !== 0) {
            percent = 100
          }
          setGrowthPercent(percent)

          // 按来源统计存款（收入-支出），来源为收入和支出的并集
          const allSources = Array.from(new Set([...Object.keys(incomeStats), ...Object.keys(expenseStats)]));
          const depositStats = {};
          allSources.forEach(source => {
            depositStats[source] = (incomeStats[source] || 0) - (expenseStats[source] || 0);
          });

          // 转换为组件所需格式
          const formattedData = Object.entries(depositStats)
            .map(([source, amount]) => {
              const config = sourceConfig[source] || sourceConfig['其他']
              return {
                progress: totalDeposit > 0 ? Math.round((amount / totalDeposit) * 100) : 0,
                title: source,
                amount: `¥${amount.toFixed(2)}`,
                subtitle: '本月收支',
                color: config.color,
                imgSrc: config.imgSrc
              }
            })
            .sort((a, b) => b.progress - a.progress)

          setData(formattedData)
        }
      } catch (error) {
        console.error('获取存款统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSourceStats()
  }, [selectedYear, selectedMonth])

  if (loading) {
    return (
      <Card>
        <CardHeader title='总存款' />
        <CardContent>
          <Typography>加载中...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={selectedYear + '年' + selectedMonth + '月存款'}
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      ></CardHeader>
      <CardContent className='flex flex-col gap-11 md:mbs-2.5'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h3'>¥{totalDeposit.toFixed(2)}</Typography>
            
          </div>
          <Typography>
            {growthPercent >= 0 ? '较上月增长' : '较上月减少'} 
            <i className={`ri-arrow-${growthPercent >= 0 ? 'up' : 'down'}-s-line align-bottom ${growthPercent >= 0 ? 'text-success' : 'text-error'}`}></i>
            <Typography component='span' color={growthPercent >= 0 ? 'success.main' : 'error.main'}>
              {Math.abs(growthPercent).toFixed(2)}%
            </Typography>
          </Typography>
        </div>
        <div className='flex flex-col gap-6'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <Avatar src={item.imgSrc} variant='rounded' className='bg-actionHover' />
              <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-0.5'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.title}
                  </Typography>
                  <Typography>{item.subtitle}</Typography>
                </div>
                <div className='flex flex-col gap-2 items-center'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.amount}
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={item.progress}
                    className='is-20 bs-1'
                    color={item.color}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TotalEarning