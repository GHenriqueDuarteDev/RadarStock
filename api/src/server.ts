import express from "express";
import { userRouter } from "../routes";

const app = express();
app.use(express.json());
const port = 3001;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/user", userRouter);

app.listen(port, "0.0.0.0", () => {
  console.log("API pronta na porta 3001");
});
