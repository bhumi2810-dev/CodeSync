/**
 * Per-language starter templates and helpers for CodeSync Editor.
 */

export const STARTER_CODE = {
  javascript: `// Welcome to CodeSync - JavaScript Workspace
function main() {
  console.log("Hello from CodeSync JavaScript!");
}

main();
`,
  python: `# Welcome to CodeSync - Python Workspace
def main():
    print("Hello from CodeSync Python!")

if __name__ == "__main__":
    main()
`,
  java: `// Welcome to CodeSync - Java Workspace
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from CodeSync Java!");
    }
}
`,
};

/**
 * Returns clean starter code for a given file name and optional language.
 */
export function getStarterCodeForFile(fileName: string, language?: string): string {
  const lang = (language || getLanguageFromFileName(fileName)).toLowerCase();

  if (lang === "python" || fileName.endsWith(".py")) {
    return STARTER_CODE.python;
  }

  if (lang === "java" || fileName.endsWith(".java")) {
    const rawClass = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "");
    const className = rawClass && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(rawClass) ? rawClass : "Main";
    return `// Welcome to CodeSync - Java Workspace
public class ${className} {
    public static void main(String[] args) {
        System.out.println("Hello from CodeSync Java!");
    }
}
`;
  }

  return STARTER_CODE.javascript;
}

/**
 * Determines file language identifier from filename extension.
 */
export function getLanguageFromFileName(fileName: string): string {
  if (fileName.endsWith(".py")) return "python";
  if (fileName.endsWith(".java")) return "java";
  return "javascript";
}

/**
 * Normalizes language string for Monaco Editor.
 */
export function getMonacoLanguage(language: string): string {
  const normalized = (language || "").toLowerCase().trim();
  if (normalized === "js" || normalized === "javascript") return "javascript";
  if (normalized === "py" || normalized === "python") return "python";
  if (normalized === "java") return "java";
  return normalized || "javascript";
}
