const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

app.post("/api/recognize", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const inputPath = req.file.path;
    const outputFileName = `output-${Date.now()}.jpg`;
    const outputPath = path.join(__dirname, "outputs", outputFileName);
    const pythonScript = path.join(__dirname, "python", "recognize_plate.py");

    console.log("Input:", inputPath);
    console.log("Output:", outputPath);
    console.log("Script:", pythonScript);

    execFile(
      "python",
      [pythonScript, inputPath, outputPath],
      { timeout: 30000 },
      (error, stdout, stderr) => {
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);

        if (error) {
          console.error("execFile error:", error);
          return res.status(500).json({
            error: "Plate recognition failed",
            details: stderr || error.message,
          });
        }

        if (!fs.existsSync(outputPath)) {
          return res.status(500).json({
            error: "Output image was not created",
          });
        }

        const plateText = stdout.trim() || " plate detected";

        res.json({
          plateText,
          outputImage: `/outputs/${outputFileName}`,
        });
      },
    );
  } catch (err) {
    console.error("Server route error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
