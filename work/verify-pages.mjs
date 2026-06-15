import { spawn } from "node:child_process";

const port = 3100;
const child = spawn(
  "C:\\Program Files\\nodejs\\node.exe",
  ["./node_modules/next/dist/bin/next", "start", "-p", String(port)],
  {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"]
  }
);

let logs = "";
child.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

async function waitForServer() {
  for (let index = 0; index < 40; index += 1) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Server did not become ready.\n${logs}`);
}

async function check(path) {
  const response = await fetch(`http://localhost:${port}${path}`);
  const text = await response.text();
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  if (!text.includes("ProductIQ")) throw new Error(`${path} did not render ProductIQ content`);
  return `${path} ${response.status}`;
}

try {
  await waitForServer();
  const results = [];
  for (const path of ["/", "/products", "/categories", "/login", "/signup", "/dashboard", "/products/sample-aurora-hub"]) {
    results.push(await check(path));
  }
  console.log(results.join("\n"));
} finally {
  child.kill();
}
