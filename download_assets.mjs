import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const MODELS = [
  "metal_office_desk",
  "modern_arm_chair_01",
  "steel_frame_shelves_01",
  "drawer_cabinet",
];

const TEXTURES = [
  { name: "concrete_floor_03", maps: ["diff", "nor_gl", "rough", "ao"] },
  { name: "painted_plaster", maps: ["diff", "nor_gl", "rough"] },
];

const HDRI = "studio_small_09";

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod
      .get(url, { headers: { "User-Agent": "polyhaven-dl/1.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetch(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function fetchJSON(url) {
  const buf = await fetch(url);
  return JSON.parse(buf.toString());
}

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  fs.mkdirSync(dir, { recursive: true });
  const buf = await fetch(url);
  fs.writeFileSync(dest, buf);
  console.log(`  ✓ ${path.basename(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function downloadModel(modelName) {
  console.log(`\n📦 Model: ${modelName}`);
  const files = await fetchJSON(`https://api.polyhaven.com/files/${modelName}`);

  // Get GLTF 1k format
  const gltfSection = files?.gltf?.["1k"]?.gltf;
  if (!gltfSection) {
    console.log(`  ❌ No GLTF format found`);
    return;
  }

  const modelDir = path.join("public", "models", modelName);
  await downloadFile(gltfSection.url, path.join(modelDir, path.basename(gltfSection.url)));

  if (gltfSection.include) {
    for (const [relPath, info] of Object.entries(gltfSection.include)) {
      // Prefer JPG over EXR for web
      let url = info.url;
      if (url.endsWith(".exr")) {
        const jpgUrl = url.replace("/exr/", "/jpg/").replace(".exr", ".jpg");
        try {
          await downloadFile(jpgUrl, path.join(modelDir, relPath.replace(".exr", ".jpg")));
          continue;
        } catch {
          // Fall back to EXR
        }
      }
      await downloadFile(url, path.join(modelDir, relPath));
    }
  }
}

async function downloadTexture(tex) {
  console.log(`\n🎨 Texture: ${tex.name}`);
  const texDir = path.join("public", "textures");
  fs.mkdirSync(texDir, { recursive: true });

  for (const map of tex.maps) {
    const url = `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/${tex.name}/${tex.name}_${map}_1k.jpg`;
    try {
      await downloadFile(url, path.join(texDir, `${tex.name}_${map}_1k.jpg`));
    } catch (e) {
      console.log(`  ⚠ Failed: ${tex.name}_${map}_1k.jpg — ${e.message}`);
    }
  }
}

async function downloadHDRI() {
  console.log(`\n🌅 HDRI: ${HDRI}`);
  const hdriDir = path.join("public", "hdri");
  fs.mkdirSync(hdriDir, { recursive: true });
  const url = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/${HDRI}_1k.hdr`;
  await downloadFile(url, path.join(hdriDir, `${HDRI}_1k.hdr`));
}

async function main() {
  console.log("=== Polyhaven Asset Downloader ===\n");

  for (const model of MODELS) {
    try {
      await downloadModel(model);
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
    }
  }

  for (const tex of TEXTURES) {
    try {
      await downloadTexture(tex);
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
    }
  }

  try {
    await downloadHDRI();
  } catch (e) {
    console.log(`  ❌ HDRI failed: ${e.message}`);
  }

  console.log("\n✅ Done!");
}

main();
