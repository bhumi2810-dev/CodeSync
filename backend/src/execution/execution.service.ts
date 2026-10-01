import {
  executeJavaScript,
  ExecutionResult,
} from "./languages/javascript.executor";
import { executePython } from "./languages/python.executor";
import { executeJava } from "./languages/java.executor";

export async function runCode(
  language: string,
  code: string
): Promise<ExecutionResult> {
  const normalizedLang = language.toLowerCase().trim();

  if (normalizedLang === "javascript" || normalizedLang === "js") {
    return await executeJavaScript(code);
  }

  if (normalizedLang === "python" || normalizedLang === "py") {
    return await executePython(code);
  }

  if (normalizedLang === "java") {
    return await executeJava(code);
  }

  return {
    output: "",
    error: `Unsupported language: "${language}". Only JavaScript, Python, and Java are supported.`,
    timedOut: false,
  };
}

