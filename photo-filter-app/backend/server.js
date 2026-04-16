const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { execFile } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/process", upload.single("image"), (req, res) => {
  const inputPath = req.file.path;
  const filter = req.body.filter;
  const outputFileName = `output-${Date.now()}.jpg`;
  const outputPath = path.join(__dirname, "outputs", outputFileName);

  execFile(
    "python",
    [
      path.join(__dirname, "python", "processor.py"),
      inputPath,
      outputPath,
      filter,
    ],
    (error, stdout, stderr) => {
      if (error) {
        console.error("Python error:", stderr);
        return res.status(500).json({ error: "Image processing failed" });
      }

      res.json({
        outputImage: `/outputs/${outputFileName}`,
      });
    },
  );
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
