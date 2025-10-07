'use client';
import { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useDateContext } from '@/contexts/DateContext';
import InputLabel from '@mui/material/InputLabel';
// 新增：导入 Next.js 路由钩子
import { useRouter } from 'next/navigation';
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
  // 获取路由实例
  const router = useRouter();
  // 获取日期上下文
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    yearOptions,
    monthOptions
  } = useDateContext();

  // 处理年份变化 - 新增路由刷新
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    // 刷新当前页面（保留当前路由）
    router.refresh();
  };

  // 处理月份变化 - 新增路由刷新
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    // 刷新当前页面（保留当前路由）
    router.refresh();
  };

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        {/* 年月选择器 */}
        <div className='flex items-center gap-2'>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="year-select-label">年份</InputLabel>
            <Select
              labelId="year-select-label"
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
              value={selectedMonth}
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
      </div>
      
      <div className='flex items-center'>
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