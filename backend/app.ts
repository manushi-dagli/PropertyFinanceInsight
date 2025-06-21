import express from "express";
import allRoutes from "./routes/index";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:8080",
  })
);

app.use(express.json()); // ✅ parse JSON bodies

app.use("/api", allRoutes);
// Start the server
app.listen(3000, "0.0.0.0", () => {
  console.log("Server started on port 3000");
});

export default app;
