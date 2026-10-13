import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Ensure Node.js dependencies exist
function checkAndInstallNodeModules() {
  const viteBin = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
  if (!fs.existsSync(viteBin)) {
    console.log('\x1b[33m[setup]\x1b[0m Installing frontend dependencies (npm install)...');
    execSync('npm install', {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    });
    console.log('\x1b[32m[setup]\x1b[0m Frontend dependencies installed successfully.');
  }
}

// 2. Detect or create Python virtual environment
function findPython() {
  const venvPython = process.platform === 'win32'
    ? path.join(__dirname, '.venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '.venv', 'bin', 'python');

  if (fs.existsSync(venvPython)) {
    return venvPython;
  }

  // Detect system Python candidate
  const systemCandidates = ['python', 'python3', 'py'];
  let systemPython = null;
  for (const cmd of systemCandidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      systemPython = cmd;
      break;
    } catch {
      // try next
    }
  }

  if (!systemPython) {
    throw new Error('No Python installation found. Please ensure Python 3.10+ is installed and available in PATH.');
  }

  // Automatically create .venv if missing
  const venvDir = path.join(__dirname, '.venv');
  if (!fs.existsSync(venvDir)) {
    console.log('\x1b[33m[setup]\x1b[0m Creating Python virtual environment (.venv)...');
    try {
      execSync(`${systemPython} -m venv .venv`, { cwd: __dirname, stdio: 'inherit' });
      if (fs.existsSync(venvPython)) {
        console.log('\x1b[32m[setup]\x1b[0m Virtual environment created successfully.');
        return venvPython;
      }
    } catch (err) {
      console.warn('\x1b[33m[setup]\x1b[0m Could not create .venv; proceeding with system Python:', systemPython);
      return systemPython;
    }
  }

  return venvPython;
}

// 3. Ensure Python requirements are installed
function checkAndInstallRequirements(pythonCmd) {
  console.log('\x1b[36m[setup]\x1b[0m Checking Python environment...');
  const checkCode = 'import fastapi, uvicorn, torch, torchvision, transformers, cv2, PIL, numpy, huggingface_hub';
  let needsInstall = false;

  try {
    execSync(`${pythonCmd} -c "${checkCode}"`, { stdio: 'ignore' });
    console.log('\x1b[32m[setup]\x1b[0m All Python dependencies are satisfied.');
  } catch {
    needsInstall = true;
  }

  if (needsInstall) {
    console.log('\x1b[33m[setup]\x1b[0m Installing Python dependencies from requirements.txt...');
    execSync(`${pythonCmd} -m pip install -r requirements.txt`, {
      cwd: __dirname,
      stdio: 'inherit',
    });
    console.log('\x1b[32m[setup]\x1b[0m Dependencies installed successfully.');
  }

  // 4. Verify model weights exist
  const modelDir = path.join(__dirname, 'models', 'videomae');
  const modelWeights = path.join(modelDir, 'model.safetensors');
  if (!fs.existsSync(modelWeights)) {
    console.log('\x1b[33m[setup]\x1b[0m Downloading fine-tuned VideoMAE model weights (FaceForensics++)...');
    fs.mkdirSync(modelDir, { recursive: true });
    const initScript = [
      "from huggingface_hub import hf_hub_download",
      "import shutil",
      "downloaded = hf_hub_download(repo_id='Vansh180/VideoMae-ffc23-deepfake-detector', filename='model.safetensors')",
      "shutil.copy(downloaded, 'models/videomae/model.safetensors')",
      "print('Trained model weights installed successfully.')"
    ].join('; ');
    execSync(`${pythonCmd} -c "${initScript}"`, {
      cwd: __dirname,
      stdio: 'inherit',
    });
  }
}

// Helper to free port if already occupied
function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && parseInt(pid) > 0 && parseInt(pid) !== process.pid) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } catch {
            // ignore if already exited
          }
        }
      }
    } else {
      const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (pids) {
        for (const pid of pids.split('\n')) {
          if (pid && pid !== String(process.pid)) {
            process.kill(parseInt(pid), 'SIGTERM');
          }
        }
      }
    }
  } catch {
    // Port was already free
  }
}

// 5. Start backend and frontend
function start() {
  checkAndInstallNodeModules();
  const pythonCmd = findPython();
  checkAndInstallRequirements(pythonCmd);

  // Clean up previous runs if ports are still held
  freePort(8000);
  freePort(5173);

  console.log('\x1b[35m[deepfake-forensics]\x1b[0m Starting Backend (FastAPI :8000) and Frontend (Vite :5173)...');


  // Spawn Python backend
  const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'server:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  backend.stdout.on('data', (data) => {
    process.stdout.write(`\x1b[36m[backend]\x1b[0m ${data}`);
  });
  backend.stderr.on('data', (data) => {
    process.stderr.write(`\x1b[36m[backend]\x1b[0m ${data}`);
  });

  // Spawn Vite frontend
  const viteBin = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
  const frontend = spawn(viteBin, [], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  frontend.stdout.on('data', (data) => {
    process.stdout.write(`\x1b[32m[frontend]\x1b[0m ${data}`);
  });
  frontend.stderr.on('data', (data) => {
    process.stderr.write(`\x1b[32m[frontend]\x1b[0m ${data}`);
  });

  // Handle termination
  const cleanExit = () => {
    console.log('\n\x1b[33m[shutdown]\x1b[0m Stopping backend and frontend servers...');
    try {
      if (process.platform === 'win32') {
        if (backend.pid) execSync(`taskkill /F /T /PID ${backend.pid}`, { stdio: 'ignore' });
        if (frontend.pid) execSync(`taskkill /F /T /PID ${frontend.pid}`, { stdio: 'ignore' });
        freePort(8000);
        freePort(5173);
      } else {
        backend.kill();
        frontend.kill();
      }
    } catch {
      // ignore
    }
    process.exit();
  };

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);

  backend.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.error(`\x1b[31m[backend]\x1b[0m Exited with code ${code}`);
    }
  });

  frontend.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.error(`\x1b[31m[frontend]\x1b[0m Exited with code ${code}`);
    }
  });
}

start();
