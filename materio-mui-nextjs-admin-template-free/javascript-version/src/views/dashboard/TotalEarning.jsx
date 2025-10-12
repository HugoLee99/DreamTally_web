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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSourceStats = async () => {
      try {
        const response = await fetch('/api/transactions')
        const result = await response.json()
        
        if (result.success && result.data) {
          // 按来源统计收入和支出
          const incomeStats = {}
          const expenseStats = {}
          let totalIncome = 0
          let totalExpense = 0
          result.data.forEach(item => {
            const source = item.来源 || '其他'
            const amount = parseFloat(item.乘后金额) || 0
            if (item['收/支'] === '收入') {
              totalIncome += amount
              incomeStats[source] = (incomeStats[source] || 0) + amount
            } else if (item['收/支'] === '支出') {
              totalExpense += amount
              expenseStats[source] = (expenseStats[source] || 0) + amount
            }
          })

          // 计算总存款
          const totalDeposit = totalIncome - totalExpense
          setTotalDeposit(totalDeposit)

          // 按来源统计存款（收入-支出）
          const depositStats = {}
          Object.keys(incomeStats).forEach(source => {
            depositStats[source] = incomeStats[source] - (expenseStats[source] || 0)
          })

          // 转换为组件所需格式
          const formattedData = Object.entries(depositStats)
            .map(([source, amount]) => {
              const config = sourceConfig[source] || sourceConfig['其他']
              return {
                progress: totalDeposit > 0 ? Math.round((amount / totalDeposit) * 100) : 0,
                title: source,
                amount: `¥${amount.toFixed(2)}`,
                subtitle: '累计存款',
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
  }, [])

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
        title='总存款'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      ></CardHeader>
      <CardContent className='flex flex-col gap-11 md:mbs-2.5'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h3'>¥{totalDeposit.toFixed(2)}</Typography>
          </div>
          <Typography>所有收入减去支出后的总存款</Typography>
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