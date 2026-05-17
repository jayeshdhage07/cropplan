const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const net = require('net');
const os = require('os');
const http = require('http');

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const config = {
  frontendPath: './frontend',
  backendPath: './backend',

  frontendPort: 4200,
  backendPort: 8000,

  // Commands
  frontendStartCommand: 'npm start',
  backendStartCommand: 'uvicorn main:app --host 0.0.0.0 --port 8000 --reload',

  backendType: 'fastapi', // auto | flask | fastapi | django | custom
  packageManager: 'auto', // auto | npm | pnpm | yarn

  // Health checks
  backendHealthUrl: 'http://localhost:8000/docs',
  backendReadyTimeoutMs: 30000,

  // Environment 
  frontendEnvFiles: ['src/environments/environment.ts'],
  backendEnvFiles: ['.env'],
  requiredFrontendEnvVars: [],
  requiredBackendEnvVars: ['DATABASE_URL', 'JWT_SECRET_KEY'],

  // Python Settings
  venvDir: 'venv',

  // Execution behavior
  killPortIfBusy: true,
  reinstallDependencies: false, // Set to true to force reinstall
};

// ==========================================
// 🎨 UTILITIES
// ==========================================
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

function log(prefix, msg, color = colors.reset) {
  console.log(`${color}[${prefix}]${colors.reset} ${msg}`);
}

function fatal(prefix, msg) {
  console.error(`\n${colors.red}[FATAL] [${prefix}] ${msg}${colors.reset}`);
  process.exit(1);
}

function runSync(cmd, cwd, silent = true) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' }).trim();
  } catch (err) {
    return null;
  }
}

// ==========================================
// 🛠️ 1. FOLDER AND FILE CHECKS
// ==========================================
function checkFolders() {
  log('init', 'Checking project structure...', colors.blue);

  const fPath = path.resolve(config.frontendPath);
  const bPath = path.resolve(config.backendPath);

  if (!fs.existsSync(fPath)) fatal('frontend', `Missing frontend directory at ${fPath}`);
  if (!fs.existsSync(bPath)) fatal('backend', `Missing backend directory at ${bPath}`);
  if (!fs.existsSync(path.join(fPath, 'package.json'))) fatal('frontend', 'Missing package.json');
  if (!fs.existsSync(path.join(fPath, 'angular.json'))) fatal('frontend', 'Missing angular.json');

  const hasRequirements = fs.existsSync(path.join(bPath, 'requirements.txt'));
  const hasPyproject = fs.existsSync(path.join(bPath, 'pyproject.toml'));
  const hasPipfile = fs.existsSync(path.join(bPath, 'Pipfile'));

  if (!hasRequirements && !hasPyproject && !hasPipfile) {
    log('backend', 'No requirements.txt, pyproject.toml, or Pipfile found. Assuming custom setup.', colors.yellow);
  }
}

// ==========================================
// 🛠️ 2. TOOL CHECKS
// ==========================================
function checkTools() {
  log('init', 'Checking system tools...', colors.blue);

  const nodeVer = runSync('node -v', '.');
  if (!nodeVer) fatal('system', 'Node.js is not installed.');
  log('system', `Node version: ${nodeVer}`);

  const pyVer = runSync('python --version', '.') || runSync('python3 --version', '.');
  if (!pyVer) fatal('system', 'Python is not installed.');
  log('system', `Python version: ${pyVer}`);
}

// ==========================================
// 🛠️ 3. FRONTEND DEPENDENCIES
// ==========================================
function checkFrontendDeps() {
  const fPath = path.resolve(config.frontendPath);
  const nodeModulesExists = fs.existsSync(path.join(fPath, 'node_modules'));

  let pm = config.packageManager;
  if (pm === 'auto') {
    if (fs.existsSync(path.join(fPath, 'yarn.lock'))) pm = 'yarn';
    else if (fs.existsSync(path.join(fPath, 'pnpm-lock.yaml'))) pm = 'pnpm';
    else pm = 'npm';
  }

  log('frontend', `Using package manager: ${pm}`);

  if (!nodeModulesExists || config.reinstallDependencies) {
    log('frontend', 'Installing dependencies...', colors.yellow);
    let installCmd = 'npm install';
    if (pm === 'npm') installCmd = 'npm install'; // or npm ci
    if (pm === 'yarn') installCmd = 'yarn install';
    if (pm === 'pnpm') installCmd = 'pnpm install';

    runSync(installCmd, fPath, false);
  } else {
    log('frontend', 'node_modules found. Skipping install.', colors.green);
  }
}

// ==========================================
// 🛠️ 4. BACKEND DEPENDENCIES
// ==========================================
function checkBackendDeps() {
  const bPath = path.resolve(config.backendPath);
  const venvPath = path.join(bPath, config.venvDir);

  const isWindows = os.platform() === 'win32';
  // On Windows, executables have .exe extension inside Scripts/
  const exeSuffix = isWindows ? '.exe' : '';
  const scriptsDir = isWindows ? 'Scripts' : 'bin';
  const pipExe = path.join(venvPath, scriptsDir, `pip${exeSuffix}`);
  const pythonExe = path.join(venvPath, scriptsDir, `python${exeSuffix}`);
  const uvicornExe = path.join(venvPath, scriptsDir, `uvicorn${exeSuffix}`);

  if (!fs.existsSync(venvPath)) {
    log('backend', 'Creating virtual environment...', colors.yellow);
    const pyCmd = runSync('python -c "print(1)"', '.') ? 'python' : 'python3';
    const result = runSync(`${pyCmd} -m venv ${config.venvDir}`, bPath, false);
    if (!fs.existsSync(pythonExe)) {
      fatal('backend', `Failed to create venv. Ensure Python ${pyCmd} is properly installed.`);
    }
  } else {
    log('backend', 'Virtual environment found.', colors.green);
  }

  if (!fs.existsSync(pythonExe)) {
    fatal('backend', `Python executable not found in venv at ${pythonExe}\n  → Try deleting the 'venv' folder and run again to recreate it.`);
  }
  log('backend', `Using Python: ${pythonExe}`, colors.green);

  if (fs.existsSync(path.join(bPath, 'requirements.txt')) && config.reinstallDependencies) {
    log('backend', 'Installing requirements.txt...', colors.yellow);
    runSync(`"${pipExe}" install -r requirements.txt`, bPath, false);
  }

  // Use venv's uvicorn directly if available, otherwise fall back to module run
  if (fs.existsSync(uvicornExe)) {
    config.backendStartCommand = config.backendStartCommand.replace(/^uvicorn/, `"${uvicornExe}"`);
  } else {
    // Fall back to python -m uvicorn
    config.backendStartCommand = config.backendStartCommand.replace(/^uvicorn (.+)/, `"${pythonExe}" -m uvicorn $1`);
  }
  config.backendStartCommand = config.backendStartCommand.replace(/^python/, `"${pythonExe}"`);
}

// ==========================================
// 🛠️ 5. ENVIRONMENT VALIDATION
// ==========================================
function checkEnvVariables() {
  log('init', 'Validating environment files...', colors.blue);
  const bPath = path.resolve(config.backendPath);

  config.backendEnvFiles.forEach(file => {
    const filePath = path.join(bPath, file);
    if (!fs.existsSync(filePath)) fatal('backend', `Missing environment file: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    config.requiredBackendEnvVars.forEach(v => {
      if (!content.includes(`${v}=`)) fatal('backend', `Missing required env var in ${file}: ${v}`);
    });
  });
  log('backend', 'Environment variables validated.', colors.green);
}

// ==========================================
// 🛠️ 6. PORT CHECKS & KILLER
// ==========================================
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

function killPort(port) {
  const isWindows = os.platform() === 'win32';
  try {
    if (isWindows) {
      // Get all lines from netstat and extract every unique PID listening on the port
      const output = runSync(`netstat -ano | findstr :${port}`, '.');
      if (output) {
        const pids = [...new Set(
          output.split('\n')
            .filter(line => line.includes('LISTENING') || line.includes('ESTABLISHED'))
            .map(line => line.trim().split(/\s+/).pop())
            .filter(pid => pid && /^\d+$/.test(pid) && pid !== '0')
        )];
        pids.forEach(pid => {
          runSync(`taskkill /PID ${pid} /F`, '.');
          log('system', `Killed PID ${pid} on port ${port}`, colors.yellow);
        });
      }
    } else {
      runSync(`lsof -ti:${port} | xargs kill -9`, '.');
    }
    // Wait briefly for OS to release the port
    execSync('timeout /t 1 /nobreak >nul 2>&1 || sleep 1', { shell: true, stdio: 'ignore' });
    log('system', `Port ${port} is now free.`, colors.yellow);
  } catch (e) {
    fatal('system', `Could not kill process on port ${port}: ${e.message}`);
  }
}

async function verifyPorts() {
  if (await isPortInUse(config.backendPort)) {
    if (config.killPortIfBusy) killPort(config.backendPort);
    else fatal('backend', `Port ${config.backendPort} is already in use.`);
  }
  if (await isPortInUse(config.frontendPort)) {
    if (config.killPortIfBusy) killPort(config.frontendPort);
    else fatal('frontend', `Port ${config.frontendPort} is already in use.`);
  }
}

// ==========================================
// 🛠️ 8. STARTUP & HEALTH CHECKS
// ==========================================
async function waitForBackend() {
  log('backend', `Waiting for backend health check at ${config.backendHealthUrl}...`, colors.yellow);

  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = setInterval(() => {
      http.get(config.backendHealthUrl, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 404) {
          clearInterval(check);
          log('backend', 'Backend is healthy and responding!', colors.green);
          resolve();
        }
      }).on('error', () => {
        if (Date.now() - startTime > config.backendReadyTimeoutMs) {
          clearInterval(check);
          reject(new Error('Backend health check timed out.'));
        }
      });
    }, 1000);
  });
}

function startProcess(name, cmd, cwd, color, extraEnv = {}) {
  const [command, ...args] = cmd.split(' ');
  const proc = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...extraEnv }
  });

  proc.stdout.on('data', data => {
    const text = data.toString();
    // Auto-answer 'Y' if ng serve asks about port conflict
    if (text.includes('Would you like to use a different port?')) {
      log(name, 'Port conflict detected — auto-answering Y to use next available port...', colors.yellow);
      proc.stdin.write('Y\n');
    }
    process.stdout.write(`${color}[${name}]${colors.reset} ${text}`);
  });
  proc.stderr.on('data', data => process.stderr.write(`${colors.red}[${name} ERR]${colors.reset} ${data}`));

  proc.on('close', code => {
    if (code !== 0 && code !== null) {
      log(name, `Exited unexpectedly with code ${code}`, colors.red);
      process.exit(code);
    }
  });

  return proc;
}

// ==========================================
// 🚀 RUNNER EXECUTION
// ==========================================
async function main() {
  console.log(`\n${colors.cyan}====================================`);
  console.log(`🚀 Starting Full-Stack Runner`);
  console.log(`====================================${colors.reset}\n`);
  console.log(`\n${colors.cyan}====================================`);
  console.log(`🚀 Author: Jayesh Dhage`);
  console.log(`====================================${colors.reset}\n`);
  console.log(`\n${colors.cyan}====================================`);
  console.log(`🚀 Project Name: Agriculture Crop Prediction`);
  console.log(`====================================${colors.reset}\n`);

  checkFolders();
  checkTools();
  checkEnvVariables();
  await verifyPorts();

  checkFrontendDeps();
  checkBackendDeps();

  log('system', 'All pre-flight checks passed! Starting servers...', colors.green);

  // Start Backend with UTF-8 encoding to fix Windows emoji rendering
  const backendProc = startProcess(
    'backend',
    config.backendStartCommand,
    path.resolve(config.backendPath),
    colors.magenta,
    { PYTHONUTF8: '1' }
  );

  // Wait for Backend Health
  try {
    await waitForBackend();
  } catch (err) {
    backendProc.kill();
    fatal('system', err.message);
  }

  // Explicitly pass --port to ng serve to avoid interactive port conflict prompt
  const frontendCmd = config.frontendStartCommand === 'npm start'
    ? `ng serve --port ${config.frontendPort}`
    : config.frontendStartCommand;

  // Start Frontend
  const frontendProc = startProcess('frontend', frontendCmd, path.resolve(config.frontendPath), colors.cyan);

  // Final URLs
  console.log(`\n${colors.green}====================================`);
  console.log(`✅  Both servers are running!`);
  console.log(`  Frontend: http://localhost:${config.frontendPort}`);
  console.log(`  Backend:  http://localhost:${config.backendPort}/docs`);
  console.log(`====================================${colors.reset}\n`);

  // Graceful Shutdown
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Shutting down cleanly...${colors.reset}`);
    backendProc.kill();
    frontendProc.kill();
    process.exit(0);
  });
}

main();
