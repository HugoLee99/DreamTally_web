'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import OptionMenu from '@core/components/option-menu';
import { useDateContext } from '@/contexts/DateContext';
import { formatExcelDate } from '@/utils/dateUtils';

// 确保动态导入正确，添加ssr: false以避免服务端渲染问题
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), {
  ssr: false,
  loading: () => <CircularProgress size={24} /> // 加载状态
});

// 分类颜色映射
const categoryColors = {
  "工资": '#FF6B35',      
  "亲朋资助": '#2ECC71',
  "奖金": '#4779E4',      // 沉稳蓝色系，传达消费理性
  "副业、兼职": '#9B59B6',      // 优雅紫色系，代表健康呵护
  "补贴": '#3498DB',      // 知性蓝色系，体现知识与成长
  "存款利息": '#F39C12',      // 明快黄色系，展现娱乐活力
  "其他": '#95A5A6'      
};

const MonthlyEarning = () => {
  const theme = useTheme();
  // 1. 初始化状态设置默认值，避免空数组导致图表初始化失败
  const [series, setSeries] = useState([0]);
  const [categories, setCategories] = useState(['加载中...']);
  const [colors, setColors] = useState(['#E5E7EB']);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedYear, selectedMonth } = useDateContext();

  useEffect(() => {
    // 重置状态，确保切换年月时重新加载
    setIsLoading(true);
    setSeries([1]);
    setCategories(['加载中...']);
    setColors(['#E5E7EB']);

    console.log('筛选年月:', selectedYear, selectedMonth);

    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transactions = data.data;
          
          const MonthlyEarning = transactions.filter(item => {
            const transDate = formatExcelDate(item['交易时间']);
            if (!transDate) return false;
            
            const isMonthMatch = transDate.getMonth() + 1 === selectedMonth;
            const isYearMatch = transDate.getFullYear() === selectedYear;
            const isExpense = item['收/支'] === '收入';
            
            return isExpense && isMonthMatch && isYearMatch;
          });

          console.log('筛选后的收入数据:', MonthlyEarning);

          // 2. 处理空数据场景
          if (MonthlyEarning.length === 0) {
            setCategories(['无收入数据']);
            setSeries([1]); // 至少有一个数据点，确保图表渲染
            setColors(['#E5E7EB']);
            setIsLoading(false);
            return;
          }

          // 按分类统计
          const categoryMap = {};
          MonthlyEarning.forEach(item => {
            const category = item['类别标记2'] || '其他';
            const amount = Math.abs(Number(item['乘后金额'] || 0));
            categoryMap[category] = (categoryMap[category] || 0) + amount;
          });

          // 转换为图表数据
          const entries = Object.entries(categoryMap);
          const newCategories = entries.map(([name]) => name);
          const newSeries = entries.map(([, value]) => value);
          const newColors = entries.map(([name]) => categoryColors[name] || '#6B7280');

          // 3. 确保三个数组长度一致（关键修复）
          console.log('图表数据校验:', {
            categoriesLength: newCategories.length,
            seriesLength: newSeries.length,
            colorsLength: newColors.length
          });

          // 只有当三个数组长度一致时才更新状态
          if (newCategories.length === newSeries.length && newSeries.length === newColors.length) {
            setCategories(newCategories);
            setSeries(newSeries);
            setColors(newColors);
          } else {
            console.error('图表数据长度不匹配，无法渲染');
            setCategories(['数据错误']);
            setSeries([1]);
            setColors(['#EF4444']);
          }
        }
      })
      .catch(error => {
        console.error('获取交易数据失败:', error);
        setCategories(['加载失败']);
        setSeries([1]);
        setColors(['#EF4444']);
      })
      .finally(() => {
        setIsLoading(false); // 无论成功失败，都结束加载状态
      });
  }, [selectedYear, selectedMonth]);

  // 4. 确保options配置正确引用状态变量
  const options = {
    chart: { 
      type: 'pie', 
      parentHeightOffset: 0, 
      toolbar: { show: false },
      // 添加动画，确保数据更新时重新渲染
      animations: {
        enabled: true,
        easing: 'easeinout'
      }
    },
    labels: categories, // 直接引用状态变量
    label: {
      style: {
        colors: theme.palette.text.primary, // 标签文字颜色跟随主题
      }
    },
    colors: colors,     // 直接引用状态变量
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { 
      show: true, // 显示图例，方便调试
      position: 'bottom',
      labels: { colors: theme.palette.text.primary  // 使用主题颜色
      }
    },
    tooltip: { 
      y: { 
        formatter: val => `¥${val.toLocaleString()}` 
      } 
    },
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
              label: '总收入',
              formatter: w => `¥${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()}`
            }
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader 
        title={`${selectedYear}年${selectedMonth}月收入分类`} 
        
      />
      <CardContent>
        <div className='flex justify-center items-center min-h-[280px]'>
          {isLoading ? (
            <CircularProgress /> // 加载中显示进度条
          ) : (
            <AppReactApexCharts 
              type='pie' 
              height={280} 
              width='100%' 
              options={options} 
              series={series} // 确保传递最新的series
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyEarning;