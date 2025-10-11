'use client';
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
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
  // 弹窗相关状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  // 保存所有筛选后的收入记录
  const [allRecords, setAllRecords] = useState([]);
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
          
          const monthlyEarning = transactions.filter(item => {
            const transDate = formatExcelDate(item['交易时间']);
            if (!transDate) return false;
            const isMonthMatch = transDate.getMonth() + 1 === selectedMonth;
            const isYearMatch = transDate.getFullYear() === selectedYear;
            const isIncome = item['收/支'] === '收入';
            return isIncome && isMonthMatch && isYearMatch;
          });

          setAllRecords(monthlyEarning); // 保存所有筛选后的收入记录

          console.log('筛选后的收入数据:', monthlyEarning);

          // 2. 处理空数据场景
          if (monthlyEarning.length === 0) {
            setCategories(['无收入数据']);
            setSeries([1]);
            setColors(['#E5E7EB']);
            setIsLoading(false);
            return;
          }

          // 按分类统计
          const categoryMap = {};
          monthlyEarning.forEach(item => {
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
      animations: {
        enabled: true,
        easing: 'easeinout'
      },
      // 添加点击事件
      events: {
        dataPointSelection: (event, chartContext, config) => {
          setSelectedIndex(config.dataPointIndex);
          setDialogOpen(true);
        }
      }
    },
    labels: categories,
    label: {
      style: {
        colors: theme.palette.text.primary,
      }
    },
    colors: colors,
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { 
      show: true,
      position: 'bottom',
      labels: { colors: theme.palette.text.primary }
    },
    tooltip: { 
      y: { formatter: val => `¥${val.toLocaleString()}` }
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
            <CircularProgress />
          ) : (
            <AppReactApexCharts 
              type='pie' 
              height={280} 
              width='100%' 
              options={options} 
              series={series}
            />
          )}
        </div>
        {/* 弹窗部分 */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>分类详情</DialogTitle>
          <DialogContent>
            {selectedIndex !== null && categories[selectedIndex] ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {categories[selectedIndex]}
                </Typography>
                {/* 收入记录列表 */}
                {(() => {
                  const currentCategory = categories[selectedIndex];
                  const records = allRecords.filter(item => (item['类别标记2'] || '其他') === currentCategory);
                  if (records.length === 0) {
                    return <Typography variant="body2">暂无该分类收入记录</Typography>;
                  }
                  return (
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>时间</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>数据来源</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>金额</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>备注</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>交易对象</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{formatExcelDate(item['交易时间'])?.toLocaleDateString() || '-'}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item['来源'] || '-'}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>¥{Math.abs(Number(item['乘后金额'] || 0)).toLocaleString()}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item['商品']  || '-'}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item['交易对方'] || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </>
            ) : (
              <Typography variant="body2">未选中分类</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>关闭</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MonthlyEarning;