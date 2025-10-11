import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises'; // 全程用异步文件API，避免同步限制
import { existsSync, chmodSync } from 'fs';

// 1. 固定文件路径（确保无特殊字符）
const EXCEL_FILE_PATH = path.resolve(process.cwd(), 'src', 'data', 'data.xlsx');
console.log('Excel文件路径:', EXCEL_FILE_PATH);

// 2. 初始化：确保目录和权限（启动时执行）
async function initExcelEnv() {
  const dir = path.dirname(EXCEL_FILE_PATH);
  try {
    // 创建目录（若不存在）
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
      console.log('已创建data目录:', dir);
    }
    // 设置目录权限（Windows/Linux通用，避免权限不足）
    chmodSync(dir, 0o755);
    // 若文件已存在，提前设置文件可写权限
    if (existsSync(EXCEL_FILE_PATH)) {
      chmodSync(EXCEL_FILE_PATH, 0o644);
      console.log('文件权限已设置为可读写');
    }
  } catch (error) {
    console.error('初始化环境失败:', error.message);
  }
}
initExcelEnv();

// 3. 读取Excel（无问题，保留原逻辑）
async function readExcelFile() {
  try {
    if (!existsSync(EXCEL_FILE_PATH)) {
      console.log('文件不存在，返回空数组');
      return [];
    }

    // 验证文件可读写
    await fs.access(EXCEL_FILE_PATH, fs.constants.R_OK | fs.constants.W_OK);
    
    const fileBuffer = await fs.readFile(EXCEL_FILE_PATH);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0] || '明细';
    const worksheet = workbook.Sheets[sheetName];
    
    const data = worksheet ? XLSX.utils.sheet_to_json(worksheet) : [];
    console.log('读取成功，数据条数:', data.length);
    return data;

  } catch (error) {
    console.error('读取失败:', error.message);
    // 提示文件锁定问题（常见场景）
    if (error.message.includes('EBUSY') || error.message.includes('locked')) {
      console.error('⚠️  请关闭Excel或其他占用文件的程序！');
    }
    return [];
  }
}

// 4. 写入Excel：核心修复——用异步buffer写入替代同步API
async function writeExcelFile(data) {
  try {
    // 校验数据格式
    if (!Array.isArray(data)) {
      throw new Error('写入数据必须是数组');
    }
    if (data.length === 0) {
      console.log('无数据可写入');
      return false;
    }

    const dir = path.dirname(EXCEL_FILE_PATH);
    // 再次确认目录权限
    chmodSync(dir, 0o755);

    // 关键步骤：
    // 1. 先将Excel工作簿转为二进制buffer（避免同步写入API）
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '交易记录');
    // 生成Excel的buffer（异步写入的核心）
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', // 输出为buffer
      bookType: 'xlsx', // 指定文件类型
      bookSST: false // 禁用共享字符串表，减少兼容性问题
    });

    // 2. 用异步API写入buffer到文件（绕开xlsx的同步writeFileSync）
    await fs.writeFile(EXCEL_FILE_PATH, excelBuffer);
    // 写入后再次确认权限
    chmodSync(EXCEL_FILE_PATH, 0o644);

    // 验证写入结果（检查文件大小和修改时间）
    const fileStats = await fs.stat(EXCEL_FILE_PATH);
    if (fileStats.size === 0) {
      throw new Error('写入后文件为空，可能失败');
    }

    console.log('写入成功！当前数据条数:', data.length);
    console.log('文件大小:', fileStats.size, '字节');
    console.log('最后修改时间:', fileStats.mtime);
    return true;

  } catch (error) {
    console.error('写入失败:', error.message);
    // 特殊场景处理：文件被锁定时提示
    if (error.message.includes('EBUSY') || error.message.includes('locked')) {
      console.error('⚠️  错误原因：文件被Excel或其他程序占用，请关闭后重试！');
    }
    return false;
  }
}

// 5. GET请求（无修改，正常读取）
export async function GET() {
  try {
    const data = await readExcelFile();
    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length,
      message: '数据获取成功'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '获取数据失败', error: error.message },
      { status: 500 }
    );
  }
}

// 6. POST请求（保持逻辑，调用修复后的写入方法）
export async function POST(request) {
  try {
    // 解析请求体（处理JSON格式错误）
    let newTransaction;
    try {
      newTransaction = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, message: '请求格式错误，请传JSON数据' },
        { status: 400 }
      );
    }

    // 验证必填字段
    const requiredFields = ['交易时间', '收支' , '乘后金额', '类别标记1'];
    const missingFields = requiredFields.filter(field => !newTransaction[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `缺少必填字段: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 读取现有数据 → 添加新数据 → 异步写入
    const existingData = await readExcelFile();
    const updatedData = [...existingData, newTransaction];
    const writeSuccess = await writeExcelFile(updatedData);

    if (writeSuccess) {
      // 写入后读取最新数据返回
      const latestData = await readExcelFile();
      return NextResponse.json({ 
        success: true, 
        message: '交易记录添加成功',
        newRecord: newTransaction,
        totalCount: latestData.length
      });
    } else {
      return NextResponse.json(
        { success: false, message: '写入失败，请检查文件是否被占用' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '添加记录失败', error: error.message },
      { status: 500 }
    );
  }
}