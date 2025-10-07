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
// 1. 导入日期上下文和格式化工具
import { useDateContext } from '@/contexts/DateContext';

import { formatExcelDate } from '@/utils/dateUtils';
const Transactions = () => {
  const [stats, setStats] = useState({
    当月收入: '0',
    当月支出: '0',
    当月结余: '0',
    累计存款: '0'
  });

  // 2. 获取用户选择的年月（从上下文）
  const { selectedYear, selectedMonth } = useDateContext();

  useEffect(() => {
    // 3. 打印选中年月用于调试
    console.log('选中年月:', selectedYear, selectedMonth);

    // 从 API 获取交易数据
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transactions = data.data;

          // 4. 筛选用户选择年月的数据（而非当前系统时间）
          const monthlyData = transactions.filter(item => {
            // 使用统一的日期处理函数解析（支持Excel序列号和字符串）
            const transDate = formatExcelDate(item['交易时间']);
            // 过滤无效日期
            if (!transDate) return false;
            
            // 注意：getMonth() 返回 0-11，需加1匹配 selectedMonth（1-12）
            return transDate.getFullYear() === selectedYear && 
                   transDate.getMonth() + 1 === selectedMonth;
          });

          console.log('筛选后的数据:', monthlyData); // 调试：查看筛选结果

          // 5. 计算统计值（逻辑不变）
          const 当月收入 = monthlyData
            .filter(item => item['收/支'] === '收入')
            .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0);
            
          const 当月支出 = monthlyData
            .filter(item => item['收/支'] === '支出')
            .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0);

          const 当月结余 = 当月收入 - 当月支出;
          const 累计存款 = transactions
            .filter(item => item['收/支'] === '收入')
            .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0) 
            - transactions
              .filter(item => item['收/支'] === '支出')
              .reduce((sum, item) => sum + Number(item['乘后金额'] || 0), 0);

          setStats({
            当月收入: `¥${当月收入.toLocaleString()}`,
            当月支出: `¥${当月支出.toLocaleString()}`,
            当月结余: `¥${当月结余.toLocaleString()}`,
            累计存款: `¥${累计存款.toLocaleString()}`
          });
        }
      });
  }, [selectedYear, selectedMonth]); // 6. 依赖选中年月，变化时重新筛选

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
            <span className='text-textSecondary'>{selectedYear}年{selectedMonth}月</span> {/* 显示选中的年月 */}
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