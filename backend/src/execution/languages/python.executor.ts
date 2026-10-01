import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { ExecutionResult } from "./javascript.executor";

export async function executePython(
  code: string,
  timeoutMs: number = 5000
): Promise<ExecutionResult> {
  // Check if Docker is available
  const isDockerAvailable = await checkDocker();

  if (isDockerAvailable) {
    try {
      return await executeInDocker(code, "codesync-python", "main.py", "python3 main.py", timeoutMs);
    } catch (dockerErr: any) {
      console.warn("Docker execution failed, falling back to local sandbox:", dockerErr.message);
    }
  }

  // Fallback to local Python runner with timeout
  return executeLocally(code, timeoutMs);
}

function checkDocker(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("docker info", { timeout: 1500 }, (error) => {
      resolve(!error);
    });
  });
}

function executeInDocker(
  code: string,
  imageName: string,
  fileName: string,
  command: string,
  timeoutMs: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesync-py-"));
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    const dockerArgs = [
      "run",
      "--rm",
      "--network",
      "none",
      "--memory",
      "128m",
      "--cpus",
      "0.5",
      "-v",
      `${tempDir}:/app:ro`,
      imageName,
      "sh",
      "-c",
      command,
    ];

    const child = spawn("docker", dockerArgs);

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGKILL");
      } catch (e) {}
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      if (timedOut) {
        resolve({
          output: stdout,
          error: "Execution timed out (5s limit exceeded)",
          timedOut: true,
          exitCode: code,
        });
      } else {
        resolve({
          output: stdout.trim(),
          error: stderr.trim() || undefined,
          timedOut: false,
          exitCode: code,
        });
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      resolve({
        output: stdout,
        error: err.message,
        timedOut: false,
      });
    });
  });
}

function executeLocally(
  code: string,
  timeoutMs: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesync-local-py-"));
    const filePath = path.join(tempDir, "main.py");
    fs.writeFileSync(filePath, code);

    // Try python or python3 or py
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const child = spawn(pythonCmd, [filePath]);

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGKILL");
      } catch (e) {}
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      if (timedOut) {
        resolve({
          output: stdout,
          error: "Execution timed out (5s limit exceeded)",
          timedOut: true,
          exitCode: code,
        });
      } else {
        resolve({
          output: stdout.trim(),
          error: stderr.trim() || undefined,
          timedOut: false,
          exitCode: code,
        });
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      resolve({
        output: stdout,
        error: `Python execution error: ${err.message}. Please ensure Python is installed or Docker is running.`,
        timedOut: false,
      });
    });
  });
}
