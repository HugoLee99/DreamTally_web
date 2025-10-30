'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';

// Excel 序列号转换函数
function dateToExcelSerial(date) {
  // Excel序列号起点是1900-01-01，JS起点是1970-01-01
  // Excel序列号 = 天数 + 1（Excel的bug，1900年2月29日不存在，但算一天）
  const excelEpoch = new Date(1900, 0, 1);
  const msPerDay = 24 * 60 * 60 * 1000;
  return ((date - excelEpoch) / msPerDay) + 2;
}

// 原表字段顺序（请根据你的实际Excel表头调整）
const EXCEL_FIELDS = [
  '交易时间', '来源', '收/支', '类型', '交易对方', '商品', '金额', '类别标记1', '类别标记2'
];

const AddTransactionDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    交易时间: new Date(),
    来源: '',
    收支: '',
    类型: '',
    交易对方: '',
    商品: '',
    金额: '',
    类别标记1: '',
    类别标记2: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target ? event.target.value : event
    }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.来源) newErrors.来源 = '数据来源不能为空';
    if (!formData.收支) newErrors.收支 = '收支类型不能为空';
    if (!formData.交易对方) newErrors.交易对方 = '交易对象不能为空';
    if (!formData.金额) newErrors.金额 = '金额不能为空';
    // 支出时校验一级分类，收入时校验二级分类
    if (formData.收支 === '支出' && !formData.类别标记1) newErrors.类别标记1 = '支出分类不能为空';
    if (formData.收支 === '收入' && !formData.类别标记2) newErrors.类别标记2 = '收入分类不能为空';
    // 验证金额是否为数字
    if (formData.金额 && isNaN(parseFloat(formData.金额))) {
      newErrors.金额 = '金额必须是数字';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // 构造完整字段对象，按表头顺序，缺失字段自动补空
      const formattedData = {};
      EXCEL_FIELDS.forEach(field => {
        if (field === '交易时间') {
          formattedData[field] = dateToExcelSerial(formData.交易时间);
        } else if (field === '收/支') {
          formattedData[field] = formData['收支'] || '';
        } else if (field === '金额') {
          let amount = formData['金额'] || '';
          formattedData[field] = amount;
        } else {
          // 自动补空：如果没有该字段则补空字符串
          formattedData[field] = (formData[field] !== undefined && formData[field] !== null) ? formData[field] : '';
        }
      });
     
     
      onSave(formattedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      交易时间: new Date(),
      来源: '',
      收支: '',
      类型: '',
      交易对方: '',
      商品: '',
      金额: '',
      类别标记1: '',
      类别标记2: ''
    });
    setErrors({});
    onClose();
  };

  // 新增：控制分类框显示
  const showFirstCategory = formData['收支'] === '支出';
  const showSecondCategory = formData['收支'] === '收入';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">添加交易记录</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="交易日期"
                  value={formData.交易时间}
                  onChange={handleChange('交易时间')}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth error={!!errors.交易时间} helperText={errors.交易时间} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="交易时间"
                  value={formData.交易时间}
                  onChange={handleChange('交易时间')}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.来源}>
                  <InputLabel>数据来源</InputLabel>
                  <Select
                    value={formData.来源}
                    onChange={handleChange('来源')}
                    label="数据来源"
                  >
                    <MenuItem value="支付宝">支付宝</MenuItem>
                    <MenuItem value="微信">微信</MenuItem>
                    <MenuItem value="银行 APP">银行卡</MenuItem>
                    <MenuItem value="现金">现金</MenuItem>
                    <MenuItem value="其他">其他</MenuItem>
                  </Select>
                </FormControl>
                {errors.来源 && <Typography color="error" variant="caption">{errors.来源}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.收支}>
                  <InputLabel>收支类型</InputLabel>
                  <Select
                    value={formData.收支}
                    onChange={handleChange('收支')}
                    label="收支类型"
                  >
                    <MenuItem value="收入">收入</MenuItem>
                    <MenuItem value="支出">支出</MenuItem>
                    <MenuItem value="不计收支">不计收支</MenuItem>
                  </Select>
                </FormControl>
                {errors.收支 && <Typography color="error" variant="caption">{errors.收支}</Typography>}
              </Grid>

              {/* <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.类型}>
                  <InputLabel>交易类型</InputLabel>
                  <Select
                    value={formData.类型}
                    onChange={handleChange('类型')}
                    label="交易类型"
                  >
                    <MenuItem value="餐饮美食">餐饮美食</MenuItem>
                    <MenuItem value="交通出行">交通出行</MenuItem>
                    <MenuItem value="商户消费">商户消费</MenuItem>
                    <MenuItem value="生活服务">生活服务</MenuItem>
                    <MenuItem value="医疗健康">医疗健康</MenuItem>
                    <MenuItem value="教育学习">教育学习</MenuItem>
                    <MenuItem value="休闲娱乐">休闲娱乐</MenuItem>
                  </Select>
                </FormControl>
                {errors.类型 && <Typography color="error" variant="caption">{errors.类型}</Typography>}
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="交易对象"
                  value={formData.交易对方}
                  onChange={handleChange('交易对方')}
                  error={!!errors.交易对方}
                  helperText={errors.交易对方}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="细节描述"
                  value={formData.商品}
                  onChange={handleChange('商品')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="金额"
                  type="number"
                  value={formData.金额}
                  onChange={handleChange('金额')}
                  error={!!errors.金额}
                  helperText={errors.金额}
                />
              </Grid>
            {showFirstCategory && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.类别标记1}>
                  <InputLabel>支出分类</InputLabel>
                  <Select
                    value={formData.类别标记1}
                    onChange={handleChange('类别标记1')}
                    label="支出分类"
                  >
                    <MenuItem value="a餐饮">餐饮 </MenuItem>
                    <MenuItem value="b购物">购物 </MenuItem>
                    <MenuItem value="c起居">起居 </MenuItem>
                    <MenuItem value="d健康">健康 </MenuItem>
                    <MenuItem value="e学习">学习 </MenuItem>
                    <MenuItem value="f娱乐">娱乐 </MenuItem>
                    <MenuItem value="g通勤">通勤 </MenuItem>
                    <MenuItem value="h社交">社交 </MenuItem>
                    <MenuItem value="其他">其他  </MenuItem>
                  </Select>
                </FormControl>
                {errors.类别标记1 && <Typography color="error" variant="caption">{errors.类别标记1}</Typography>}
              </Grid>)}
            {showSecondCategory && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.类别标记2}>
                  <InputLabel>收入分类</InputLabel>
                  <Select
                    value={formData.类别标记2}
                    onChange={handleChange('类别标记2')}
                    label="收入分类"
                  >
                    <MenuItem value="工资">工资</MenuItem>
                    <MenuItem value="亲朋资助">亲朋资助</MenuItem>
                    <MenuItem value="奖金">奖金</MenuItem>
                    <MenuItem value="副业、兼职">副业、兼职</MenuItem>
                    <MenuItem value="补贴">补贴</MenuItem>
                    <MenuItem value="存款利息">存款利息</MenuItem>
                    <MenuItem value="其他">其他</MenuItem>
                  </Select>
                </FormControl>
                {errors.类别标记2 && <Typography color="error" variant="caption">{errors.类别标记2}</Typography>}
              </Grid>)}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddTransactionDialog;
