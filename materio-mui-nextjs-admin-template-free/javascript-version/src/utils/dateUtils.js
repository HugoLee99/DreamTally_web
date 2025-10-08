/**
 * 解析Excel日期格式（支持数字序列号和字符串）
 * @param {number|string} value - Excel日期序列号或日期字符串
 * @returns {Date|null} 解析后的Date对象，无效日期返回null
 */
export const formatExcelDate = (value) => {
  // 处理字符串格式日期
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  }

  // 处理数字格式（Excel日期序列号）
  if (typeof value !== 'number' || isNaN(value)) {
    return null;
  }

  // Excel日期起始点修正（处理1900年闰年bug）
  const excelStart = new Date(1900, 0, 1);
  const daysToAdd = value <= 60 ? value - 1 : value - 2;
  const milliseconds = daysToAdd * 24 * 60 * 60 * 1000;
  
  return new Date(excelStart.getTime() + milliseconds);
};


// 新增 isDateInMonth 函数并导出
export const isDateInMonth = (dateValue, targetYear, targetMonth) => {
  // 1. 解析日期
  const date = formatExcelDate(dateValue);
  if (!date) return false; // 无效日期返回false
  
  // 2. 提取年份和月份（注意月份+1）
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  // 3. 对比目标年月
  return year === targetYear && month === targetMonth;
};