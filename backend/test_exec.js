const http = require("http");

function testExecute(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/execute",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== 1. JS Fibonacci ===");
  const jsFib = `
function fib(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq.slice(0, n);
}
console.log(fib(10).join(", "));
`;
  console.log(await testExecute({ language: "javascript", code: jsFib }));

  console.log("\n=== 2. Python Fibonacci ===");
  const pyFib = `
def fib(n):
    seq = [0, 1]
    for i in range(2, n): seq.append(seq[-1] + seq[-2])
    return seq[:n]
print(", ".join(map(str, fib(10))))
`;
  console.log(await testExecute({ language: "python", code: pyFib }));

  console.log("\n=== 3. Java Fibonacci ===");
  const javaFib = `
public class Main {
    public static void main(String[] args) {
        int n = 10;
        int[] fib = new int[n];
        fib[0] = 0; fib[1] = 1;
        for (int i = 2; i < n; i++) fib[i] = fib[i - 1] + fib[i - 2];
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(", ");
            sb.append(fib[i]);
        }
        System.out.println(sb.toString());
    }
}
`;
  console.log(await testExecute({ language: "java", code: javaFib }));

  console.log("\n=== 4. Java Compile Error ===");
  const javaErr = `
public class Main {
    public static void main(String[] args) {
        int x = "not a number";
    }
}
`;
  console.log(await testExecute({ language: "java", code: javaErr }));

  console.log("\n=== 5. Java Runtime Exception ===");
  const javaRuntimeErr = `
public class Main {
    public static void main(String[] args) {
        int[] arr = new int[2];
        System.out.println(arr[10]);
    }
}
`;
  console.log(await testExecute({ language: "java", code: javaRuntimeErr }));
}

runTests().catch(console.error);
