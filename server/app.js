const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const multer = require('multer');
const fs = require('fs');
require("dotenv").config({ path: "./config/config.env" });
const {verifyAccessToken} = require('./services/tokenService')
const {validate} = require('./middleware/Auth')
app.use(
  cors({
    origin: "*",
  })
);
//dot env setup


//body parse
app.use(express.json({ extends: true, limit: "4mb" }));





//===================file uploading handle===========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
app.post("/upload", validate, upload.single("media"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Generate file URL
  const fileUrl = `${process.env.ENVIRONMENT === "DEV" ? req.protocol : "https"}://${req.get("host")}/uploads/${req.file.filename}`;

  res.json({ fileUrl });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//================================================================================





// router register
const userRouter = require("./router/userRouter");
app.use("/user", userRouter);

app.get("/test", (req, res) => {
  //test router
  res.status(200).json({
    message: "Server is healthy",
    success: true,
  });
});
// static file render
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", async (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
});
module.exports = app;
