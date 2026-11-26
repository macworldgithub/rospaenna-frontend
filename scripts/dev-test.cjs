const { spawn } = require("node:child_process");
const { resolve } = require("node:path");

const frontend = resolve(__dirname, "..");
const backend = resolve(frontend, "..", "rosapenna-backend");
const python = resolve(backend, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
const launcher = spawn(python, ["-u", "-m", "scripts.run_n06_simulation", "--frontend", frontend, "--frontend-port", "3033", "--port", "4043", "--visitor-availability", ...process.argv.slice(2)], {
  cwd: backend,
  stdio: "inherit",
});
launcher.on("error", () => {
  console.error("Could not start the backend. Run uv sync in rosapenna-backend first.");
  process.exitCode = 1;
});
launcher.on("exit", (code) => { process.exitCode = code ?? 1; });
