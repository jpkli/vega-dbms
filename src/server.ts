import * as path from "path"
import * as express from "express"
import { Request, Response } from "express"
import Bundler from "parcel-bundler"
// import { DuckDbTable } from './duckdb'

const { PORT = 3000 } = process.env
const entry = path.resolve("src/demo.html")
const bundle = new Bundler(entry)
const app = express()
app.use(bundle.middleware())

// const duckDbTable = new DuckDbTable({name: "housing"})
// let dataReady = false
// const DATA_FILE = "data/housing.csv"
// duckDbTable.importDatafile(DATA_FILE).then(() => {
//   dataReady = true
// })
// .catch(err => {
//   console.log(err)
// })
// app.get("/", async (req: Request, res: Response) => {
//   res.send({
//     message: {dataReady}
//   });
// });

app.get("/query", async (req: Request, res: Response) => {
  res.send({
    message: {query: req.query}
  })
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})
