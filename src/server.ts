import * as express from "express"
import { Request, Response } from "express"
import { DuckDbTable } from './duckdb'
import testSpecs from '../assets/cars-specs.json'

const { PORT = 3000 } = process.env
const app = express()

app.use(express.static('public'))

let dataReady = false
const { table, datafile } = testSpecs
const duckDbTable = new DuckDbTable({name: table})

duckDbTable.importDatafile(datafile).then(() => {
  dataReady = true
})
.catch(err => {
  console.log(err)
})
app.get("/", async (req: Request, res: Response) => {
  res.send({
    message: {dataReady}
  });
});

app.get("/dbms", async (req: Request, res: Response) => {
  if (typeof req.query.sql === 'string') {
    const result = await duckDbTable.runQuery(req.query.sql)
    res.send({
      message: {result}
    })
  } else {
    res.status(400)
    res.send(false)
  }

})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})
