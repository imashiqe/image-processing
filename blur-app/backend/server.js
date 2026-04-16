const express = require("express");
const cors = require("cors");
const path = require("path");
const imageRoutes = require("./routes/image");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

app.use("/api", imageRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
