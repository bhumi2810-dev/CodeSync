import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export interface ExecutionResult {
  output: string;
  error?: string;
  timedOut: boolean;
  exitCode?: number | null;
}

export async function executeJavaScript(
  code: string,
  timeoutMs: number = 5000
): Promise<ExecutionResult> {
  // Check if Docker is available
  const isDockerAvailable = await checkDocker();

  if (isDockerAvailable) {
    try {
      return await executeInDocker(code, "codesync-js", "index.js", "node index.js", timeoutMs);
    } catch (dockerErr: any) {
      console.warn("Docker execution failed, falling back to local sandbox:", dockerErr.message);
    }
  }

  // Fallback to local sandbox with timeout
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
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesync-js-"));
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    // Run container with limits: 128MB RAM, 0.5 CPU, no network, timeout
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
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesync-local-js-"));
    const filePath = path.join(tempDir, "script.js");
    fs.writeFileSync(filePath, code);

    const child = spawn("node", [filePath]);

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
