"use client";
// MUI Imports
import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useDateContext } from '@/contexts/DateContext';
import { formatExcelDate } from '@/utils/dateUtils';
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

const DEFAULT_TARGET = 4000; // 可根据实际需求调整默认目标

const Award = () => {
  const [currentSave, setCurrentSave] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState(DEFAULT_TARGET.toString());
  const { selectedYear, selectedMonth } = useDateContext();

  useEffect(() => {
    // 获取本月收入和支出，计算结余
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transactions = data.data;
          const monthlyData = transactions.filter(item => {
            const transDate = formatExcelDate(item['交易时间']);
            if (!transDate) return false;
            return transDate.getFullYear() === selectedYear && transDate.getMonth() + 1 === selectedMonth;
          });
          const income = monthlyData
            .filter(item => item['收/支'] === '收入')
            .reduce((sum, item) => sum + Number(item['金额'] || 0), 0);
          const expense = monthlyData
            .filter(item => item['收/支'] === '支出')
            .reduce((sum, item) => sum + Number(item['金额'] || 0), 0);
          setCurrentSave(income - expense);
        }
      });
  }, [selectedYear, selectedMonth]);

  // 计算完成率
  const percent = target > 0 ? Math.round((currentSave / target) * 100) : 0;

  return (
    <Card>
      <CardContent className='flex flex-col gap-2 relative items-start'>
        <div>
          <Typography variant='h5'>本月目标存钱金额完成情况 📊</Typography>
          <Typography>离目标又近一步啦！ </Typography>
        </div>
        <div>
          <Typography variant='h4' color='primary'>
            ¥{currentSave.toLocaleString()}/{target.toLocaleString()}
          </Typography>
          <Typography>目标完成率：{percent}% </Typography>
        </div>
        <Button size='small' variant='contained' onClick={() => {
          setInputValue(target.toString());
          setDialogOpen(true);
        }}>
          更改本月目标
        </Button>
        <img
          src='/images/pages/trophy.png'
          alt='trophy image'
          height={102}
          className='absolute inline-end-7 bottom-6'
        />
        {/* 目标修改弹窗 */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>设置本月存钱目标</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="目标金额 (元)"
              type="number"
              fullWidth
              value={inputValue}
              onChange={e => setInputValue(e.target.value.replace(/[^\d]/g, ''))}
              inputProps={{ min: 0 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button
              variant="contained"
              onClick={() => {
                const val = parseInt(inputValue, 10);
                if (!isNaN(val) && val > 0) {
                  setTarget(val);
                  setDialogOpen(false);
                }
              }}
            >
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Award
