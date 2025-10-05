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
    color: 'primary',
    imgSrc: '/images/logos/alipay.png'
  },
  '微信': {
    color: 'success',
    imgSrc: '/images/logos/wechat.png'
  },
  '银行卡': {
    color: 'info',
    imgSrc: '/images/logos/bank-card.png'
  },
  '现金': {
    color: 'warning',
    imgSrc: '/images/logos/cash.png'
  },
  '其他': {
    color: 'secondary',
    imgSrc: '/images/logos/other.png'
  }
}

const TotalEarning = () => {
  const [data, setData] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSourceStats = async () => {
      try {
        const response = await fetch('/api/transactions')
        const result = await response.json()
        
        if (result.success && result.data) {
          // 筛选收入类型并按来源统计
          const sourceStats = result.data
            .filter(item => item.收支 === '收入')
            .reduce((acc, item) => {
              const source = item.来源 || '其他'
              const amount = parseFloat(item.乘后金额) || 0
              
              if (acc[source]) {
                acc[source] += amount
              } else {
                acc[source] = amount
              }
              return acc
            }, {})

          // 计算总收入
          const total = Object.values(sourceStats).reduce((sum, val) => sum + val, 0)
          setTotalIncome(total)

          // 转换为组件所需格式
          const formattedData = Object.entries(sourceStats)
            .map(([source, amount]) => {
              const config = sourceConfig[source] || sourceConfig['其他']
              return {
                progress: total > 0 ? Math.round((amount / total) * 100) : 0,
                title: source,
                amount: `¥${amount.toFixed(2)}`,
                subtitle: '累计收入',
                color: config.color,
                imgSrc: config.imgSrc
              }
            })
            .sort((a, b) => b.progress - a.progress) // 按比例降序排列

          setData(formattedData)
        }
      } catch (error) {
        console.error('获取收入统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSourceStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader title='总收入' />
        <CardContent>
          <Typography>加载中...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='总收入'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      ></CardHeader>
      <CardContent className='flex flex-col gap-11 md:mbs-2.5'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h3'>¥{totalIncome.toFixed(2)}</Typography>
            <i className='ri-arrow-up-s-line align-bottom text-success'></i>
            <Typography component='span' color='success.main'>
              10%
            </Typography>
          </div>
          <Typography>较上月增长 10%</Typography>
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