'use client';
import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import AddTransactionDialog from '@/components/AddTransactionDialog';
import { useDateContext } from '@/contexts/DateContext'; // 导入日期上下文
import { formatExcelDate, isDateInMonth } from '@/utils/dateUtils'; // 导入日期工具函数

const columns = [
  { field: '交易时间', headerName: '交易日期' },
  { field: '来源', headerName: '数据来源' },
  { field: '收/支', headerName: '收支类型' },
  { field: '类型', headerName: '交易类型' },
  { field: '交易对方', headerName: '交易对象' },
  { field: '商品', headerName: '商品名称' },
  { field: '乘后金额', headerName: '金额' },
  { field: '类别标记1', headerName: '一级分类' },
  { field: '类别标记2', headerName: '二级分类' }
];

const TransactionsPage = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]); // 存储筛选后的数据
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 获取选中的年月（从上下文）
  const { selectedYear, selectedMonth } = useDateContext()
  // 1. 首次加载和年月变化时重新请求所有数据
  useEffect(() => {
    fetchData();
  }, []);

  // 2. 当选中的年月变化时，筛选数据（不重新请求，提高性能）
  useEffect(() => {
    if (rows.length === 0) return; // 数据未加载时不执行

    // 筛选符合当前年月的数据
    const filtered = rows.filter(item => 
      isDateInMonth(item['交易时间'], selectedYear, selectedMonth)
    );
    setFilteredRows(filtered);
    console.log(`筛选 ${selectedYear}年${selectedMonth}月 数据:`, filtered);
  }, [selectedYear, selectedMonth, rows]); // 依赖：年月变化或原始数据变化

  // 将Excel日期序列号转换为格式化的日期时间字符串
  const formatExcelDate = (serial) => {
    // 检查是否已经是字符串格式（如果后端已处理）
    if (typeof serial === 'string') {
      // 尝试解析已有的日期字符串
      const date = new Date(serial);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
      return serial; // 如果无法解析，返回原始字符串
    }

    // 如果是数字，则按Excel序列号处理
    if (typeof serial !== 'number' || isNaN(serial)) {
      return serial || '';
    }

    // Excel起始日期是1900年1月1日，修正闰年bug
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // 计算日期（减2是为了修正Excel的1900年闰年错误）
    const date = new Date(excelEpoch.getTime() + (serial - 2) * millisecondsPerDay);
    
    return formatDate(date);
  };

  // 格式化日期为 "YYYY/MM/DD HH:MM" 格式
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  
// 请求原始数据的函数
  const fetchData = () => {
    setLoading(true);
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setRows(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('数据加载失败');
        setLoading(false);
      });
  };

  // 添加交易后重新请求数据（保持不变）
  const handleAddTransaction = async (transactionData) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      if (response.ok) fetchData(); // 添加成功后刷新
    } catch (error) {
      console.error('添加失败:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant='h5'>
            {selectedYear}年{selectedMonth}月 交易记录 {/* 显示当前筛选的年月 */}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            添加交易记录
          </Button>
        </Box>

        {/* 表格数据使用筛选后的 filteredRows */}
        {loading ? (
          <Typography>正在加载数据...</Typography>
        ) : error ? (
          <Typography color='error'>{error}</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell key={col.field} align='center' sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>
                      {col.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row, idx) => ( // 这里使用筛选后的 filteredRows
                  <TableRow key={idx}>
                    {columns.map(col => (
                      <TableCell key={col.field} align='center'>
                        {col.field === '交易时间' 
                          ? formatExcelDate(row[col.field]) 
                          : row[col.field] || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <AddTransactionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleAddTransaction}
        />
      </CardContent>
    </Card>
  );
};

export default TransactionsPage;
