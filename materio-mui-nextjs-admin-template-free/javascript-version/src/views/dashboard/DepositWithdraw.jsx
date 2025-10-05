'use client';
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useEffect, useState } from 'react'

// Component Imports
import Link from '@components/Link'

// 图标映射表 - 按来源显示不同图标
const sourceLogos = {
  '支付宝': '/images/logos/alipay.png',
  '微信': '/images/logos/wechat.png',
  '银行卡': '/images/logos/bank-card.png',
  '现金': '/images/logos/cash.png',
  '其他': '/images/logos/other.png'
}

const DepositWithdraw = () => {
  const [depositData, setDepositData] = useState([])
  const [withdrawData, setWithdrawData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        const result = await response.json()
        
        if (result.success && result.data) {
          // 按交易时间排序（最新的在前）
          const sortedData = [...result.data].sort((a, b) => {
            return new Date(b.交易时间) - new Date(a.交易时间)
          })

          // 筛选收入和支出数据
          const deposits = sortedData
            .filter(item => item.收支 === '收入')
            .slice(0, 5) // 取最近5条
            .map(item => ({
              amount: `+¥${parseFloat(item.乘后金额).toFixed(2)}`,
              title: item.交易对方 || '未知',
              subtitle: item.类别标记1 || '无分类',
              logo: sourceLogos[item.来源] || sourceLogos['其他']
            }))

          const withdraws = sortedData
            .filter(item => item.收支 === '支出')
            .slice(0, 5) // 取最近5条
            .map(item => ({
              amount: `-¥${parseFloat(item.乘后金额).toFixed(2)}`,
              title: item.交易对方 || '未知',
              subtitle: item.类别标记1 || '无分类',
              logo: sourceLogos[item.来源] || sourceLogos['其他']
            }))

          setDepositData(deposits)
          setWithdrawData(withdraws)
        }
      } catch (error) {
        console.error('获取交易数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <Card>
        <Grid container>
          <Grid item xs={12} md={6} className='border-be md:border-be-0 md:border-ie'>
            <CardHeader title='Deposit' />
            <CardContent>
              <Typography>加载中...</Typography>
            </CardContent>
          </Grid>
          <Grid item xs={12} md={6}>
            <CardHeader title='Withdraw' />
            <CardContent>
              <Typography>加载中...</Typography>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    )
  }

  return (
    <Card>
      <Grid container>
        <Grid item xs={12} md={6} className='border-be md:border-be-0 md:border-ie'>
          <CardHeader
            title='收入'
            action={
              <Typography component={Link} className='font-medium' color='primary'>
                查看全部
              </Typography>
            }
          />
          <CardContent className='flex flex-col gap-5'>
            {depositData.length > 0 ? (
              depositData.map((item, index) => (
                <div key={index} className='flex items-center gap-4'>
                  <img src={item.logo} alt={item.title} width={30} />
                  <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.title}
                      </Typography>
                      <Typography>{item.subtitle}</Typography>
                    </div>
                    <Typography color='success.main' className='font-medium'>
                      {item.amount}
                    </Typography>
                  </div>
                </div>
              ))
            ) : (
              <Typography>暂无收入记录</Typography>
            )}
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardHeader
            title='支出'
            action={
              <Typography component={Link} className='font-medium' color='primary'>
                查看全部
              </Typography>
            }
          />
          <CardContent className='flex flex-col gap-5'>
            {withdrawData.length > 0 ? (
              withdrawData.map((item, index) => (
                <div key={index} className='flex items-center gap-4'>
                  <img src={item.logo} alt={item.title} width={30} />
                  <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.title}
                      </Typography>
                      <Typography>{item.subtitle}</Typography>
                    </div>
                    <Typography color='error.main' className='font-medium'>
                      {item.amount}
                    </Typography>
                  </div>
                </div>
              ))
            ) : (
              <Typography>暂无支出记录</Typography>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default DepositWithdraw