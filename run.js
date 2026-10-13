import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Detect Python binary
function findPython() {
  const candidates = [
    path.join(__dirname, '.venv', 'bin', 'python'),
    path.join(__dirname, '.venv', 'Scripts', 'python.exe'),
    'python3',
    'python',
  ];

  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // try next
    }
  }
  throw new Error('No Python installation found. Please ensure Python 3 is installed.');
}

// 2. Ensure Python requirements are installed
function checkAndInstallRequirements(pythonCmd) {
  console.log('\x1b[36m[setup]\x1b[0m Checking Python environment...');
  const checkCode = 'import fastapi, uvicorn, torch, torchvision, transformers, cv2, PIL, numpy';
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

  // 3. Verify model weights exist
  const modelWeights = path.join(__dirname, 'models', 'videomae', 'model.safetensors');
  if (!fs.existsSync(modelWeights)) {
    console.log('\x1b[33m[setup]\x1b[0m Downloading fine-tuned VideoMAE model weights (FaceForensics++)...');
    const initScript = `
from huggingface_hub import hf_hub_download
import shutil
downloaded = hf_hub_download(repo_id='Vansh180/VideoMae-ffc23-deepfake-detector', filename='model.safetensors')
shutil.copy(downloaded, 'models/videomae/model.safetensors')
print('Trained model weights installed successfully.')
`;
    execSync(`${pythonCmd} -c "${initScript.replace(/\n/g, ' ')}"`, {
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
        if (pid && !isNaN(pid) && parseInt(pid) > 0) {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
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

// 4. Start backend and frontend
function start() {
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
    backend.kill();
    frontend.kill();
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
