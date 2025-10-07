// src/views/dashboard/Transactions.jsx
'use client';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';
import { useDateContext } from '@/contexts/DateContext'; // 导入日期上下文


const formatExcelDate = (serial) => {
  // 检查是否已经是字符串格式
  if (typeof serial === 'string') {
    // 尝试解析已有的日期字符串
    const date = new Date(serial);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null; // 无法解析的字符串
  }

  // 如果是数字，则按Excel序列号处理
  if (typeof serial !== 'number' || isNaN(serial)) {
    return null;
  }

  // Excel起始日期是1900年1月1日，修正闰年bug
  const excelEpoch = new Date(1900, 0, 1);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  
  // 计算日期（减2是为了修正Excel的1900年闰年错误）
  const date = new Date(excelEpoch.getTime() + (serial - 2) * millisecondsPerDay);
  return date;
};
const Transactions = () => {
  const [stats, setStats] = useState({
    当月收入: '0',
    当月支出: '0',
    当月结余: '0',
    累计存款: '0'
  });
  const { selectedYear, selectedMonth } = useDateContext(); // 获取选中的年月


  useEffect(() => {
    // 从 API 获取交易数据
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transactions = data.data;
          const today = new Date();
          

          // 筛选本月数据
          const monthlyData = transactions.filter(item => {
            const transactionDate = formatExcelDate(item['交易时间']);
            // console.log('交易时间:', item['交易时间'], '解析后:', transactionDate.getFullYear(),transactionDate.getMonth());
            console.log('选中年月:', transactionDate.getMonth(), selectedMonth);
            return transactionDate.getMonth() == selectedMonth && 
                   transactionDate.getFullYear() == selectedYear;
          });
          console.log('本月数据:', monthlyData);
          // 计算统计值
          const 当月收入 = monthlyData
            .filter(item => item['收支'] === '收入')
            .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0);
            
          const 当月支出 = monthlyData
            .filter(item => item['收支'] === '支出')
            .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0);

          const 当月结余 = 当月收入 - 当月支出;
          const 累计存款 = transactions
            .filter(item => item['收支'] === '收入')
            .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0) 
            - transactions
              .filter(item => item['收支'] === '支出')
              .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0);

          setStats({
            当月收入: `¥${当月收入.toLocaleString()}`,
            当月支出: `¥${当月支出.toLocaleString()}`,
            当月结余: `¥${当月结余.toLocaleString()}`,
            累计存款: `¥${累计存款.toLocaleString()}`
          });
        }
      });
  }, []);

  const data = [
    {
      stats: stats.当月收入,
      title: '当月收入',
      color: 'primary',
      icon: 'ri-pie-chart-2-line'
    },
    {
      stats: stats.当月支出,
      title: '当月支出',
      color: 'success',
      icon: 'ri-group-line'
    },
    {
      stats: stats.当月结余,
      color: 'warning',
      title: '当月结余',
      icon: 'ri-macbook-line'
    },
    {
      stats: stats.累计存款,
      color: 'info',
      title: '累计存款',
      icon: 'ri-money-dollar-circle-line'
    }
  ];

  return (
    <Card className='bs-full'>
      <CardHeader
        title='本月概览'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <p className='mbs-3'>
            <span className='font-medium text-textPrimary'>
              {stats.当月结余 > 0 ? '正向增长' : '需注意支出'} 😎
            </span>
            <span className='text-textSecondary'>this month</span>
          </p>
        }
      />
      <CardContent className='!pbs-5'>
        <Grid container spacing={2}>
          {data.map((item, index) => (
            <Grid item xs={6} md={3} key={index}>
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div>
                  <Typography>{item.title}</Typography>
                  <Typography variant='h5'>{item.stats}</Typography>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Transactions;