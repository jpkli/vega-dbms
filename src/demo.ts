import * as Vega from "vega"
import { compile as compileToVega, TopLevelSpec } from "vega-lite"
import { DatabaseTable } from "./models"
import { VegaDbTransform, ProtoVegaDbTransform } from "./main"

/* Test for porting custom Vega tranform to run query on a DuckDB Table */
class TestDatabaseTable implements DatabaseTable {
  public name: string
  
  constructor (name: string) {
    this.name = name
  }

  async runQuery (sql: string, params?: any): Promise<Record<string, unknown>[]> {
    const res = await fetch("/dbms?query=" + sql)
    return res.json()
  }
}

/* Add custom transform that use DuckDB */
Vega.transforms.duckdb = new VegaDbTransform({
  id: "duckdb",
  databaseTable: new TestDatabaseTable("vegaDuckDb")
});

/* Use prototype for custom transform as the same way in scalable-vega */
// (Vega as any).transforms.duckdb = ProtoVegaDbTransform

const vlSpec: TopLevelSpec = {
    data: { name: "table" },
    mark: "bar",
    encoding: {
      x: { field: "ocean_proximity" },
      y: { aggregate: "count" }
    }
  }

const vgSpec = compileToVega(vlSpec).spec

const aggregate = {
    type: "duckdb",
    query: {
      signal: `'select ocean_proximity, COUNT(*) from housing'`
    }
  } as any

vgSpec.data[1] = {
    name: "data_0",
    transform: [aggregate]
}

const runtime = Vega.parse(vgSpec)
const view = new Vega.View(runtime)
    .logLevel(Vega.Info)
    .renderer("svg")
    .initialize(document.querySelector("#vega-lite"))

view.runAsync()
