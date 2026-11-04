import express from "express";
import { authRouter, categoryRouter, userRouter } from "../routes";

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3001;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);

app.listen(port, "0.0.0.0", () => {
  console.log("API pronta na porta 3001");
});
