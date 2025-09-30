import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const EXCEL_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'data.xlsx');

// 读取Excel文件
function readExcelFile() {
  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      return [];
    }
    
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data;
  } catch (error) {
    console.error('读取Excel文件失败:', error);
    return [];
  }
}

// 写入Excel文件
function writeExcelFile(data) {
  try {
    // 确保目录存在
    const dir = path.dirname(EXCEL_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '交易记录');
    
    XLSX.writeFile(workbook, EXCEL_FILE_PATH);
    return true;
  } catch (error) {
    console.error('写入Excel文件失败:', error);
    return false;
  }
}

// GET请求 - 获取所有交易记录
export async function GET() {
  try {
    const data = readExcelFile();
    return NextResponse.json({ 
      success: true, 
      data: data,
      message: '数据获取成功'
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取数据失败',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// POST请求 - 添加新的交易记录
export async function POST(request) {
  try {
    const newTransaction = await request.json();
    
    // 验证必填字段
    const requiredFields = ['交易时间', '来源', '收支', '类型', '交易对方', '乘后金额', '类别标记1'];
    const missingFields = requiredFields.filter(field => !newTransaction[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `缺少必填字段: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // 读取现有数据
    const existingData = readExcelFile();
    
    // 添加新记录
    const updatedData = [...existingData, newTransaction];
    
    // 写入Excel文件
    const writeSuccess = writeExcelFile(updatedData);
    
    if (writeSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: '交易记录添加成功',
        data: newTransaction
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: '保存数据失败' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('添加交易记录失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '添加交易记录失败',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
