const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const jdkDir = path.join(process.env.USERPROFILE || "C:\\Users\\Bhumi", ".jdk");
if (!fs.existsSync(jdkDir)) {
  fs.mkdirSync(jdkDir, { recursive: true });
}

const zipPath = path.join(jdkDir, "jdk17.zip");
// Eclipse Temurin 17.0.11+9 x64 windows
const downloadUrl =
  "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.11%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.11_9.zip";

console.log("Downloading OpenJDK 17 from Adoptium...");

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https
    .get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest, cb);
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close(cb);
      });
    })
    .on("error", (err) => {
      fs.unlinkSync(dest);
      if (cb) cb(err);
    });
}

download(downloadUrl, zipPath, (err) => {
  if (err) {
    console.error("Download failed:", err);
    process.exit(1);
  }
  console.log("Download complete. Extracting zip archive...");
  try {
    execSync(`tar -xf "${zipPath}" -C "${jdkDir}"`, { stdio: "inherit" });
    fs.unlinkSync(zipPath);
    console.log("JDK 17 extracted successfully to:", jdkDir);
  } catch (e) {
    console.error("Extraction error:", e);
  }
});
