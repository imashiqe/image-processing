const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
const outputDir = path.join(__dirname, "..", "outputs");
const scriptPath = path.join(__dirname, "..", "python", "processor.py");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${name}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/blur", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const inputPath = req.file.path;
  const outputFilename = `blurred_${req.file.filename}`;
  const outputPath = path.join(outputDir, outputFilename);

  const py = spawn("python", [scriptPath, inputPath, outputPath]);

  let errorData = "";

  py.stderr.on("data", (data) => {
    errorData += data.toString();
  });

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: "Python processing failed",
        details: errorData,
      });
    }

    return res.json({
      imageUrl: `http://localhost:5000/outputs/${outputFilename}`,
    });
  });
});

module.exports = router;
