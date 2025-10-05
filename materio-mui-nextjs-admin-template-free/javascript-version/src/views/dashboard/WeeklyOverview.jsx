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
// import { formatExcelDate } from '@/utils/dateFormatter';

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'));

const WeeklyOverview = () => {
  const theme = useTheme();
  const [series, setSeries] = useState([{ name: '收支金额', data: [0, 0, 0, 0, 0, 0, 0] }]);
  const [categories, setCategories] = useState(['', '', '', '', '', '', '']);
  const [growthRate, setGrowthRate] = useState('0%');

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transactions = data.data;
          const today = new Date();
          const weekData = Array(7).fill(0); // 近7天数据
          const weekLabels = [];

          // 生成近7天日期标签
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            weekLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
          }

          // 累加每天的收支金额（收入为正，支出为负）
          transactions.forEach(item => {
            const transDate = new Date(item['交易时间']);
            const daysAgo = Math.floor((today - transDate) / (1000 * 60 * 60 * 24));
            
            if (daysAgo >= 0 && daysAgo < 7) {
              const amount = Number(item['乘后金额'] || 0);
              weekData[6 - daysAgo] += item['收支'] === '收入' ? amount : -amount;
            }
          });

          // 计算增长率（与前7天对比）
          const prevWeekData = weekData.slice(0, 3); // 简化对比：取前3天 vs 后3天
          const currWeekData = weekData.slice(4, 7);
          const prevSum = prevWeekData.reduce((a, b) => a + b, 0);
          const currSum = currWeekData.reduce((a, b) => a + b, 0);
          const rate = prevSum === 0 ? 100 : Math.round(((currSum - prevSum) / prevSum) * 100);
          setGrowthRate(`${rate}%`);

          setSeries([{ name: '收支金额', data: weekData }]);
          setCategories(weekLabels);
        }
      });
  }, []);

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
            本周收支较上周{growthRate.startsWith('-') ? '下降' : '增长'}{growthRate} 😎
          </Typography>
        </div>
        <Button fullWidth variant='contained'>详情</Button>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;