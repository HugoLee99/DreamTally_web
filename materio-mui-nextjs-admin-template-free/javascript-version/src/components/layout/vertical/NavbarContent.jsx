'use client';
import { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useDateContext } from '@/contexts/DateContext';
import InputLabel from '@mui/material/InputLabel';
// Next Imports
import Link from 'next/link'

// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  // 获取日期上下文
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    yearOptions,
    monthOptions
  } = useDateContext();
  console.log('Navbar拿到的年份选项：', yearOptions); // 应和Context里的一致
  console.log('Navbar拿到的月份选项：', monthOptions); // 应和Context里的一致
  console.log('当前年份值：', selectedYear); // 应是2020-2030之间的数字
  console.log('当前月份值：', selectedMonth); // 应是1-12之间的数字

  // 处理年份变化
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // 处理月份变化
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        {/* 新增：年月选择器 */}
        <div className='flex items-center gap-2'>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="year-select-label">年份</InputLabel>
            <Select
              labelId="year-select-label" // 与InputLabel的id关联
              id="year-select"
              value={selectedYear}
              label="年份"
              onChange={handleYearChange}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel id="month-select-label">月份</InputLabel>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={selectedMonth} // 数字类型（如10）
              label="月份"
              onChange={handleMonthChange}
            >
              {monthOptions.map(month => (
                <MenuItem key={month} value={month}>
                  {month}月
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        {/* <NavSearch /> */}
      </div>
      
      <div className='flex items-center'>
        {/* 原有代码保持不变 */}
        <ModeDropdown />
        <IconButton className='text-textPrimary'>
          <i className='ri-notification-2-line' />
        </IconButton>
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
