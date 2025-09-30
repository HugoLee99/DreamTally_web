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

const AddTransactionDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    交易时间: new Date(),
    来源: '',
    收支: '',
    类型: '',
    交易对方: '',
    商品: '',
    乘后金额: '',
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
    if (!formData.类型) newErrors.类型 = '交易类型不能为空';
    if (!formData.交易对方) newErrors.交易对方 = '交易对象不能为空';
    if (!formData.乘后金额) newErrors.乘后金额 = '金额不能为空';
    if (!formData.类别标记1) newErrors.类别标记1 = '一级分类不能为空';
    
    // 验证金额是否为数字
    if (formData.乘后金额 && isNaN(parseFloat(formData.乘后金额))) {
      newErrors.乘后金额 = '金额必须是数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // 格式化日期时间
      const formattedData = {
        ...formData,
        交易时间: formData.交易时间.toISOString()
      };
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
      乘后金额: '',
      类别标记1: '',
      类别标记2: ''
    });
    setErrors({});
    onClose();
  };

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
                    <MenuItem value="银行卡">银行卡</MenuItem>
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
                  </Select>
                </FormControl>
                {errors.收支 && <Typography color="error" variant="caption">{errors.收支}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.类型}>
                  <InputLabel>交易类型</InputLabel>
                  <Select
                    value={formData.类型}
                    onChange={handleChange('类型')}
                    label="交易类型"
                  >
                    <MenuItem value="转账">转账</MenuItem>
                    <MenuItem value="消费">消费</MenuItem>
                    <MenuItem value="充值">充值</MenuItem>
                    <MenuItem value="提现">提现</MenuItem>
                    <MenuItem value="理财">理财</MenuItem>
                    <MenuItem value="其他">其他</MenuItem>
                  </Select>
                </FormControl>
                {errors.类型 && <Typography color="error" variant="caption">{errors.类型}</Typography>}
              </Grid>

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
                  label="商品名称"
                  value={formData.商品}
                  onChange={handleChange('商品')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="金额"
                  type="number"
                  value={formData.乘后金额}
                  onChange={handleChange('乘后金额')}
                  error={!!errors.乘后金额}
                  helperText={errors.乘后金额}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.类别标记1}>
                  <InputLabel>一级分类</InputLabel>
                  <Select
                    value={formData.类别标记1}
                    onChange={handleChange('类别标记1')}
                    label="一级分类"
                  >
                    <MenuItem value="餐饮">餐饮</MenuItem>
                    <MenuItem value="交通">交通</MenuItem>
                    <MenuItem value="购物">购物</MenuItem>
                    <MenuItem value="娱乐">娱乐</MenuItem>
                    <MenuItem value="医疗">医疗</MenuItem>
                    <MenuItem value="教育">教育</MenuItem>
                    <MenuItem value="住房">住房</MenuItem>
                    <MenuItem value="其他">其他</MenuItem>
                  </Select>
                </FormControl>
                {errors.类别标记1 && <Typography color="error" variant="caption">{errors.类别标记1}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="二级分类"
                  value={formData.类别标记2}
                  onChange={handleChange('类别标记2')}
                />
              </Grid>
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
