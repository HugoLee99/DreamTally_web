// src/views/dashboard/MonthlySpending.jsx
'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import OptionMenu from '@core/components/option-menu';
// import { formatExcelDate } from '@/utils/dateFormatter';

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'));

// 分类颜色映射
const categoryColors = {
  餐饮: '#EA5455',
  交通: '#28C76F',
  购物: '#FF9F43',
  住房: '#9C27B0',
  娱乐: '#00CFE8',
  其他: '#6B7280'
};

const MonthlySpending = () => {
  const theme = useTheme();
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transactions = data.data;
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();

          // 筛选本月支出数据
          const monthlySpending = transactions.filter(item => {
            const transDate = new Date(item['交易时间']);
            return item['收支'] === '支出' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
          });

          // 按一级分类统计
          const categoryMap = {};
          monthlySpending.forEach(item => {
            const category = item['类别标记1'] || '其他';
            const amount = Number(item['乘后金额'] || 0);
            categoryMap[category] = (categoryMap[category] || 0) + amount;
          });

          // 转换为图表所需格式
          const entries = Object.entries(categoryMap);
          setCategories(entries.map(([name]) => name));
          setSeries(entries.map(([, value]) => value));
          setColors(entries.map(([name]) => categoryColors[name] || '#6B7280'));
        }
      });
  }, []);

  const options = {
    chart: { type: 'pie', parentHeightOffset: 0, toolbar: { show: false } },
    labels: categories,
    colors: colors,
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { y: { formatter: val => `¥${val.toLocaleString()}` } },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', fontWeight: 600, offsetY: 20 },
            value: { show: true, fontSize: '16px', fontWeight: 700, offsetY: -20, formatter: val => `¥${val.toLocaleString()}` },
            total: {
              show: true,
              label: '总支出',
              formatter: w => `¥${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()}`
            }
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader title='本月支出分类' action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />} />
      <CardContent>
        <div className='flex justify-center'>
          <AppReactApexCharts type='pie' height={280} width='100%' options={options} series={series} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySpending;