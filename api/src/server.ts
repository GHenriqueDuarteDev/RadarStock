import express from "express";
import {
  alertRulesRouter,
  alertsRouter,
  authRouter,
  categoryRouter,
  dashboardRouter,
  inventoryCountsRouter,
  productRouter,
  receiptsRouter,
  reportsRouter,
  salesRouter,
  stockMovementRouter,
  userRouter,
  warehouseRouter,
} from "../routes";

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3001;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/warehouses", warehouseRouter);
app.use("/movements", stockMovementRouter);
app.use("/sales", salesRouter);
app.use("/receipts", receiptsRouter);
app.use("/inventory", inventoryCountsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/reports", reportsRouter);

app.listen(port, "0.0.0.0", () => {
  console.log("API pronta na porta 3001");
});
