import express from "express"

const app = express()
const port = 3001

app.get("/health", (_req, res) => {
    res.json({ok: true})
})

app.listen(port, "0.0.0.0", () => {
    console.log("API pronta na porta 3001")
})