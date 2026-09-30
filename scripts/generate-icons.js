const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootDir = path.join(__dirname, "..");
const logoPath = path.join(rootDir, "logo", "logojagobicara.png");
const iconsDir = path.join(rootDir, "public", "icons");

async function createIcon(size, fileName, logoScale) {
  const logo = await sharp(logoPath)
    .resize({
      width: Math.round(size * logoScale),
      height: Math.round(size * logoScale),
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#FFFFFF",
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(path.join(iconsDir, fileName));
}

async function main() {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Brand logo not found: ${logoPath}`);
  }

  fs.mkdirSync(iconsDir, { recursive: true });
  await Promise.all([
    createIcon(192, "icon-192x192.png", 0.7),
    createIcon(512, "icon-512x512.png", 0.7),
    createIcon(180, "apple-touch-icon.png", 0.82),
  ]);

  console.log("PWA icons generated from the Jago Bicara logo.");
}

main().catch((error) => {
  console.error("Failed to generate PWA icons:", error);
  process.exitCode = 1;
});
