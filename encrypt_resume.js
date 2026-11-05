// encrypt_resume.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 获取命令行传入的邮箱参数
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error('❌ 用法: node encrypt_resume.js <目标邮箱地址>');
    console.error('例如: node encrypt_resume.js hr@company.com');
    process.exit(1);
}

// 1. 计算 MD5 和 SHA1
const md5Hex = crypto.createHash('md5').update(targetEmail).digest('hex');
const sha1Hex = crypto.createHash('sha1').update(targetEmail).digest('hex');

// 2. 处理 Key 和 IV (与前端 CryptoJS 逻辑严格保持一致)
// 3DES 需要 24 字节 Key，SHA1 为 20 字节，因此截取 SHA1 前 8 个字符补齐
const keyHex = sha1Hex + sha1Hex.substring(0, 8);
const keyBuffer = Buffer.from(keyHex, 'hex');

// IV 需要 8 字节，取 MD5 逆序后的前 16 个 hex 字符
const ivHex = md5Hex.split('').reverse().join('').substring(0, 16);
const ivBuffer = Buffer.from(ivHex, 'hex');

// 3. 读取原始简历 JSON 数据
const rawDataPath = path.join(__dirname, 'resume_data.json');
if (!fs.existsSync(rawDataPath)) {
    console.error('❌ 找不到原始数据文件: resume_data.json，请先创建该文件');
    process.exit(1);
}
const rawData = fs.readFileSync(rawDataPath, 'utf8');

// 4. 使用 3DES-CBC 加密并进行 Base64 编码
const cipher = crypto.createCipheriv('des-ede3-cbc', keyBuffer, ivBuffer);
let encrypted = cipher.update(rawData, 'utf8', 'base64');
encrypted += cipher.final('base64');

// 5. 生成并保存加密后的 JSON 文件
const outputDir = path.join(__dirname, 'resume');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `${md5Hex}.json`);
fs.writeFileSync(outputFile, JSON.stringify({ data: encrypted }, null, 2));

console.log('✅ 加密成功！');
console.log(`📁 目标邮箱: ${targetEmail}`);
console.log(`🔑 MD5 (文件名): ${md5Hex}`);
console.log(`🔒 文件已保存至: ${outputFile}`);