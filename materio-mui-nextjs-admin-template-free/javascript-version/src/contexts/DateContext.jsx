// src/contexts/DateContext.jsx
'use client'; // 客户端组件标识（必须保留，确保useState/useContext生效）
import { createContext, useContext, useState } from 'react';

// 1. 创建上下文并设置默认值（避免组件未被Provider包裹时取值报错）
const DateContext = createContext({
  selectedYear: new Date().getFullYear(),
  setSelectedYear: () => {}, // 空函数默认值，避免调用时报错
  selectedMonth: new Date().getMonth() + 1,
  setSelectedMonth: () => {},
  yearOptions: [],
  monthOptions: []
});

// 2. 上下文提供者组件（负责生成选项、管理选中状态）
export const DateProvider = ({ children }) => {
  const today = new Date();

  // 生成 2020-2030 年份选项（数字数组，确保与selectedYear类型一致）
  const yearOptions = [];
  for (let year = 2020; year <= 2030; year++) {
    yearOptions.push(year); // 结果：[2020, 2021, ..., 2030]
  }

  // 生成 1-12 月份选项（数字数组，确保与selectedMonth类型一致）
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1); // 结果：[1, 2, ..., 12]

  // 处理默认年份（确保默认值在2020-2030范围内，避免初始值超出选项）
  const defaultYear = Math.min(
    Math.max(today.getFullYear(), 2020), // 小于2020则取2020
    2030 // 大于2030则取2030
  );

  // 状态管理（均为数字类型，与选项数组元素类型完全匹配）
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 月份转1-12（避免0-11）

  // 3. 向子组件传递上下文值（所有属性必须完整传递，不可遗漏）
  return (
    <DateContext.Provider
      value={{
        selectedYear, // 当前选中年份（数字）
        setSelectedYear, // 更新年份的方法
        selectedMonth, // 当前选中月份（数字）
        setSelectedMonth, // 更新月份的方法
        yearOptions, // 所有年份选项（数字数组）
        monthOptions // 所有月份选项（数字数组）
      }}
    >
      {children} {/* 包裹需要使用上下文的子组件（如NavbarContent、仪表盘组件） */}
    </DateContext.Provider>
  );
};

// 4. 自定义Hook（简化其他组件的上下文调用，避免重复写useContext(DateContext)）
export const useDateContext = () => useContext(DateContext);