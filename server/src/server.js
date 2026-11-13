const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Sweety API is running!",
  });
});

app.get("/api/health",(req,res)=>{
    res.json({
        "status": "OK",
        "database": "Not connected yet"
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});