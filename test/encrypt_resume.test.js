const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(repoRoot, 'encrypt_resume.js');
const resumeDir = path.join(repoRoot, 'resume');

function cleanupFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
}

function md5Hex(value) {
  return require('node:crypto').createHash('md5').update(value).digest('hex');
}

function runScript(args) {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

test('默认情况下使用 resume_data.json 进行加密', () => {
  const email = 'default@example.com';
  const outputFile = path.join(resumeDir, `${md5Hex(email)}.json`);
  cleanupFile(outputFile);

  const stdout = runScript([email]);

  assert.match(stdout, /加密成功/);
  assert.ok(fs.existsSync(outputFile), '默认输出文件应被创建');

  const payload = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  assert.ok(payload.data && typeof payload.data === 'string');

  cleanupFile(outputFile);
});

test('支持相对路径 --file 参数', () => {
  const email = 'relative@example.com';
  const relativeDir = path.join(repoRoot, 'tmp-relative-input');
  const relativeFile = path.join(relativeDir, 'custom_resume.json');
  const outputFile = path.join(resumeDir, `${md5Hex(email)}.json`);

  fs.mkdirSync(relativeDir, { recursive: true });
  fs.writeFileSync(relativeFile, JSON.stringify({ name: 'relative path test' }, null, 2));
  cleanupFile(outputFile);

  const stdout = runScript([email, '--file', './tmp-relative-input/custom_resume.json']);

  assert.match(stdout, /源文件: .*custom_resume\.json/);
  assert.ok(fs.existsSync(outputFile), '相对路径输出文件应被创建');

  const payload = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  assert.ok(payload.data && typeof payload.data === 'string');

  cleanupFile(outputFile);
  fs.rmSync(relativeDir, { recursive: true, force: true });
});

test('支持绝对路径 --file 参数', () => {
  const email = 'absolute@example.com';
  const tempDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'resume-abs-'));
  const absoluteFile = path.join(tempDir, 'absolute_resume.json');
  const outputFile = path.join(resumeDir, `${md5Hex(email)}.json`);

  fs.writeFileSync(absoluteFile, JSON.stringify({ name: 'absolute path test' }, null, 2));
  cleanupFile(outputFile);

  const stdout = runScript([email, '--file', absoluteFile]);

  assert.match(stdout, new RegExp(`源文件: .*${absoluteFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.ok(fs.existsSync(outputFile), '绝对路径输出文件应被创建');

  const payload = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  assert.ok(payload.data && typeof payload.data === 'string');

  cleanupFile(outputFile);
  fs.rmSync(tempDir, { recursive: true, force: true });
});
