// src/views/dashboard/WeeklyOverview.jsx
'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Button';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import OptionsMenu from '@core/components/option-menu';
import { useDateContext } from '@/contexts/DateContext'; // 导入日期上下文

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'));

// 新增：参考 transactions/page.jsx 的日期处理逻辑
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

const WeeklyOverview = () => {
  const theme = useTheme();
  const [series, setSeries] = useState([{ name: '收支金额', data: [0, 0, 0, 0, 0, 0, 0] }]);
  const [categories, setCategories] = useState(['', '', '', '', '', '', '']);
  const [growthRate, setGrowthRate] = useState('0%');
  const { selectedYear, selectedMonth } = useDateContext(); // 获取选中的年月

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const allTransactions = data.data;
          
          // 修正1：使用与 transactions/page.jsx 一致的日期处理逻辑
          const monthlyTransactions = allTransactions.filter(item => {
            const transDate = formatExcelDate(item['交易时间']);
            // 过滤无效日期
            if (!transDate) return false;
            
            // 修正2：月份对比逻辑（getMonth()返回0-11，selectedMonth是1-12）
            return transDate.getFullYear() === selectedYear && 
                   transDate.getMonth() + 1 === selectedMonth;
          });

          // 修正3：生成选中月份的所有日期（而非近7天）
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
          const monthEnd = new Date(selectedYear, selectedMonth - 1, daysInMonth);

          // 按周分组统计（每月最多6周）
          const weekData = Array(6).fill(0);
          const weekLabels = [];

          // 计算选中月份的每周标签
          for (let i = 1; i <= daysInMonth; i += 7) {
            const endDay = Math.min(i + 6, daysInMonth);
            weekLabels.push(`${i}-${endDay}日`);
          }

          // 累加每日收支（收入为正，支出为负）
          monthlyTransactions.forEach(item => {
            const transDate = formatExcelDate(item['交易时间']);
            if (!transDate) return;
            
            const day = transDate.getDate();
            const weekIndex = Math.floor((day - 1) / 7); // 计算属于当月的第几周
            
            const amount = Number(item['乘后金额'] || 0);
            weekData[weekIndex] += item['收支'] === '收入' ? amount : -amount;
          });

          // 过滤空周
          const validWeekData = weekData.filter((_, i) => i < weekLabels.length);
          const validWeekLabels = weekLabels;

          // 计算增长率（与上月同期对比）
          const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
          const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
          
          const prevMonthTransactions = allTransactions.filter(item => {
            const transDate = formatExcelDate(item['交易时间']);
            if (!transDate) return false;
            return transDate.getFullYear() === prevYear && 
                   transDate.getMonth() + 1 === prevMonth;
          });

          // 计算上月每周数据
          const prevMonthDays = new Date(prevYear, prevMonth, 0).getDate();
          const prevWeekData = Array(Math.ceil(prevMonthDays / 7)).fill(0);
          
          prevMonthTransactions.forEach(item => {
            const transDate = formatExcelDate(item['交易时间']);
            if (!transDate) return;
            
            const day = transDate.getDate();
            const weekIndex = Math.floor((day - 1) / 7);
            
            const amount = Number(item['乘后金额'] || 0);
            prevWeekData[weekIndex] += item['收支'] === '收入' ? amount : -amount;
          });

          // 计算增长率（取最近两周对比）
          const currentSum = validWeekData.slice(-1)[0] || 0;
          const prevSum = prevWeekData.slice(-1)[0] || 0;
          const rate = prevSum === 0 ? 100 : Math.round(((currentSum - prevSum) / prevSum) * 100);
          setGrowthRate(`${rate}%`);

          setSeries([{ name: '收支金额', data: validWeekData }]);
          setCategories(validWeekLabels);
        }
      });
  }, [selectedYear, selectedMonth]); // 依赖选中的年月

  // 图表配置保持不变...
  const options = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 7, distributed: true, columnWidth: '40%' } },
    stroke: { width: 2, colors: ['var(--mui-palette-background-paper)'] },
    legend: { show: false },
    grid: {
      xaxis: { lines: { show: false } },
      strokeDashArray: 7,
      padding: { left: -9, top: -20, bottom: 13 },
      borderColor: 'var(--mui-palette-divider)'
    },
    dataLabels: { enabled: false },
    colors: ['var(--mui-palette-primary-main)'],
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    xaxis: { categories, tickPlacement: 'on', labels: { show: true }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetY: 2,
        offsetX: -17,
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: theme.typography.body2.fontSize },
        formatter: value => `¥${value.toLocaleString()}`
      }
    }
  };

  return (
    <Card>
      <CardHeader title='周收支概览' action={<OptionsMenu iconClassName='text-textPrimary' options={['Refresh', 'Update', 'Delete']} />} />
      <CardContent sx={{ '& .apexcharts-xcrosshairs.apexcharts-active': { opacity: 0 } }}>
        <AppReactApexCharts type='bar' height={206} width='100%' series={series} options={options} />
        <div className='flex items-center mbe-4 gap-4'>
          <Typography variant='h4'>{growthRate}</Typography>
          <Typography>
            本周收支较上月同期{growthRate.startsWith('-') ? '下降' : '增长'}{growthRate} 😎
          </Typography>
        </div>
        <Button fullWidth variant='contained'>详情</Button>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;