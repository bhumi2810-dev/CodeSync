import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { ExecutionResult } from "./javascript.executor";

export async function executeJava(
  code: string,
  timeoutMs: number = 5000
): Promise<ExecutionResult> {
  const className = extractClassName(code) || "Main";

  // Check if Docker is available
  const isDockerAvailable = await checkDocker();

  if (isDockerAvailable) {
    try {
      return await executeInDocker(code, className, timeoutMs);
    } catch (dockerErr: any) {
      console.warn("Docker execution failed, falling back to local runner:", dockerErr.message);
    }
  }

  // Fallback to local Java runner
  return executeLocally(code, className, timeoutMs);
}

function extractClassName(code: string): string {
  const publicMatch = code.match(/public\s+class\s+([A-Za-z0-9_$]+)/);
  if (publicMatch && publicMatch[1]) {
    return publicMatch[1];
  }
  const classMatch = code.match(/class\s+([A-Za-z0-9_$]+)/);
  if (classMatch && classMatch[1]) {
    return classMatch[1];
  }
  return "Main";
}

function checkDocker(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("docker info", { timeout: 1500 }, (error) => {
      resolve(!error);
    });
  });
}

function getJavaBinaries(): { javacCmd: string; javaCmd: string } {
  // Check JAVA_HOME
  if (process.env.JAVA_HOME) {
    const javac = path.join(
      process.env.JAVA_HOME,
      "bin",
      process.platform === "win32" ? "javac.exe" : "javac"
    );
    const java = path.join(
      process.env.JAVA_HOME,
      "bin",
      process.platform === "win32" ? "java.exe" : "java"
    );
    if (fs.existsSync(javac) && fs.existsSync(java)) {
      return { javacCmd: `"${javac}"`, javaCmd: java };
    }
  }

  // Check common Windows installation paths
  if (process.platform === "win32") {
    const userProfile = process.env.USERPROFILE || "C:\\Users\\Bhumi";
    const searchRoots = [
      path.join(userProfile, ".jdk"),
      "C:\\Program Files\\Microsoft",
      "C:\\Program Files\\Java",
      "C:\\Program Files\\Eclipse Adoptium",
      "C:\\Program Files (x86)\\Java",
      "C:\\Program Files\\Amazon Corretto",
      "C:\\Program Files\\Zulu",
      "C:\\Program Files\\BellSoft",
    ];

    for (const root of searchRoots) {
      if (fs.existsSync(root)) {
        try {
          // Check if root itself is a JDK (e.g. root/bin/javac.exe)
          const directJavac = path.join(root, "bin", "javac.exe");
          const directJava = path.join(root, "bin", "java.exe");
          if (fs.existsSync(directJavac) && fs.existsSync(directJava)) {
            return { javacCmd: `"${directJavac}"`, javaCmd: directJava };
          }

          const entries = fs.readdirSync(root);
          for (const entry of entries) {
            const javacPath = path.join(root, entry, "bin", "javac.exe");
            const javaPath = path.join(root, entry, "bin", "java.exe");
            if (fs.existsSync(javacPath) && fs.existsSync(javaPath)) {
              return { javacCmd: `"${javacPath}"`, javaCmd: javaPath };
            }
          }
        } catch (e) {}
      }
    }
  }

  return { javacCmd: "javac", javaCmd: "java" };
}

function executeInDocker(
  code: string,
  className: string,
  timeoutMs: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesync-java-"));
    const fileName = `${className}.java`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    const dockerArgs = [
      "run",
      "--rm",
      "--network",
      "none",
      "--memory",
      "256m",
      "--cpus",
      "0.5",
      "-v",
      `${tempDir}:/app`,
      "-w",
      "/app",
      "openjdk:17-alpine",
      "sh",
      "-c",
      `javac ${fileName} && java ${className}`,
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

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      if (timedOut) {
        resolve({
          output: stdout,
          error: "Execution timed out (5s limit exceeded)",
          timedOut: true,
          exitCode,
        });
      } else {
        resolve({
          output: stdout.trim(),
          error: stderr.trim() || undefined,
          timedOut: false,
          exitCode,
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
        error: `Docker execution error: ${err.message}`,
        timedOut: false,
      });
    });
  });
}

function executeLocally(
  code: string,
  className: string,
  timeoutMs: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const { javacCmd, javaCmd } = getJavaBinaries();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesync-local-java-"));
    const fileName = `${className}.java`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    // 1. Compile
    exec(`${javacCmd} "${filePath}"`, { timeout: timeoutMs, cwd: tempDir }, (compileErr, _cStdout, cStderr) => {
      if (compileErr) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {}

        const errorMsg = cStderr.trim() || compileErr.message;
        if (
          errorMsg.includes("is not recognized") ||
          errorMsg.includes("not found") ||
          errorMsg.includes("ENOENT")
        ) {
          return resolve({
            output: "",
            error: "Java JDK is not detected on the server. Please install Java JDK or start Docker Desktop to run Java programs.",
            timedOut: false,
          });
        }

        return resolve({
          output: "",
          error: `Compilation Error:\n${errorMsg}`,
          timedOut: false,
        });
      }

      // 2. Run
      const child = spawn(javaCmd, ["-cp", tempDir, className]);

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

      child.on("close", (exitCode) => {
        clearTimeout(timer);
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {}

        if (timedOut) {
          resolve({
            output: stdout,
            error: "Execution timed out (5s limit exceeded)",
            timedOut: true,
            exitCode,
          });
        } else {
          resolve({
            output: stdout.trim(),
            error: stderr.trim() || undefined,
            timedOut: false,
            exitCode,
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
          error: `Java runtime error: ${err.message}`,
          timedOut: false,
        });
      });
    });
  });
}
