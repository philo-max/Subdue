import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseCSVBilling } from "../src/services/billingParser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testParser(fileName, encoding = "utf-8") {
  const filePath = path.join(__dirname, "../files", fileName);
  console.log(`\n======================================================`);
  console.log(`测试读取账单文件: ${fileName}`);
  console.log(`======================================================`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    return;
  }
  
  try {
    // Read the file as binary, then decode/convert or just read with correct encoding.
    // Node.js fs.readFileSync supports 'utf-8', but since the file is generated in GBK (or utf-8),
    // let's read it. Wait, generate_test_csv.py writes in 'gbk' with errors='ignore'.
    // If we read in Node.js, we can read as binary and convert, or read as 'latin1' or we can check if it reads gbk.
    // Node.js doesn't natively support gbk out of the box without iconv-lite, but we can read it as binary and do basic replacement,
    // or since our test file was written in gbk, let's see if we can decode it, or if it can be parsed as a string.
    // Actually, we can use 'latin1' or 'utf-8'. Let's read with 'latin1' which preserves bytes, or let's read with 'utf-8'.
    // Wait, let's read it with 'utf-8' and see if it works, or read with 'latin1' and then convert or see if regex works.
    // Wait, in Windows, our python script generate_test_csv.py writes using 'gbk'.
    // Let's see if we can read with 'latin1' (binary-safe string) which allows regex matching, or let's try reading with 'utf-8' with replacement.
    // Wait! Let's read as 'utf-8' with fallback, or 'latin1'. 'latin1' is safe for byte matching since it maps 1-1.
    // Let's read as 'latin1' and see.
    let csvText = fs.readFileSync(filePath, "latin1");
    
    // We can also try converting if needed, but since parseCSVBilling uses regex,
    // let's see what happens.
    // Wait, the descriptions and dates are ASCII/numbers mostly in regex, except Chinese keywords like "支出".
    // In GBK, "支出" is 0xD6 0x90 0xB3 0xFB. If we read as latin1, it will be decoded as special chars,
    // but the word "支出" will still match the bytes.
    // Wait! To be absolutely sure, let's run the parser.
    // Let's write a simple conversion or just read.
    // Actually, let's read with gbk-equivalent or write a quick conversion if we can.
    // Wait, generate_test_csv.py was run with 'gbk'. Let's read the file.
    // Wait, is there a way to decode GBK in Node.js easily?
    // We can use a TextDecoder: `new TextDecoder("gbk").decode(fs.readFileSync(filePath))`
    // Yes! Modern JS has `TextDecoder` globally available in Node.js (v11+)!
    // `new TextDecoder("gbk").decode(Uint8Array)` is standard and works perfectly for GBK decoding in Node.js!
    // That is brilliant! Let's use `new TextDecoder("gbk").decode(fs.readFileSync(filePath))`.
    const buffer = fs.readFileSync(filePath);
    const decoder = new TextDecoder("gbk");
    const text = decoder.decode(buffer);
    
    console.log(`[+] 成功读取并用 GBK 解码文件, 长度为 ${text.length} 字符.`);
    
    console.log("[+] 开始运行周期性扣款 Heuristic 启发式挖掘算法...");
    const candidates = parseCSVBilling(text);
    
    console.log(`[+] 挖掘完成. 共检测出 ${candidates.length} 笔潜在的周期性订阅服务.\n`);
    
    const highConf = candidates.filter(c => c.confidence > 0.45);
    console.log(`[+] 筛选出高置信度候选记录 (${highConf.length} 笔):\n`);
    
    highConf.forEach((cand, idx) => {
      console.log(`${idx + 1}. 【${cand.name}】`);
      console.log(`   - 推荐金额: ${cand.currency === "USD" ? "$" : "¥"}${cand.amount} (${cand.cycle}付)`);
      console.log(`   - 自动分类: ${cand.category}`);
      console.log(`   - 首次扣款日: ${cand.firstBilledAt}`);
      console.log(`   - 置信度: ${(cand.confidence * 100).toFixed(0)}%`);
      console.log(`   - 交易频次: ${cand.occurrences} 次`);
      console.log(`   - 识别依据: ${cand.reason}`);
      console.log(`   - 历史交易记录: ${cand.history.slice(-3).map(h => `${h.date}(${cand.currency === "USD" ? "$" : "¥"}${h.amount})`).join(" -> ")}`);
      console.log(`------------------------------------------------------`);
    });
  } catch (err) {
    console.error(`❌ 解析出错:`, err);
  }
}

testParser("test_alipay.csv");
testParser("test_wechat.csv");
