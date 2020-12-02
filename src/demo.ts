import * as Vega from "vega"
import { compile as compileToVega, TopLevelSpec } from "vega-lite"
import { DatabaseTable } from "./models"
import { VegaDbTransform } from "./main"
import { vegaTransformToSql } from "./vega-sql"
import testSpecs from '../assets/cars-specs.json'

/* Test for porting custom Vega tranform to run query on a DuckDB Table */
class TestDatabaseTable implements DatabaseTable {
  public name: string
  
  constructor (name: string) {
    this.name = name
  }

  async runQuery (sql: string): Promise<Record<string, unknown>[]> {
    const res = await fetch("/dbms?sql=" + sql)
    const resJson = await res.json()
    return resJson.message?.result ?? []
  }
}

/* Add custom transform that use DuckDB */
Vega.transforms.duckdb = new VegaDbTransform({
  id: "duckdb",
  databaseTable: new TestDatabaseTable("cars")
});

const { table, specs } = testSpecs

for (const spec of specs) {
  const vlSpec = spec as TopLevelSpec
  const vgSpec = compileToVega(vlSpec).spec

  const dataSpec = vgSpec.data
  for (const [index, spec] of dataSpec.entries()) {
    if (spec.transform && spec.transform.length > 0) {
      const duckdbTransforms = []
      for (const transform of spec.transform) {
        duckdbTransforms.push({
          type: "duckdb",
          query: {
            signal: vegaTransformToSql(table, transform)
          }
        })
      }
      dataSpec[index].transform = duckdbTransforms
    }
  }
  
  const runtime = Vega.parse(vgSpec)
  const container = document.createElement("div")
 
  document.body.appendChild(container)

  new Vega.View(runtime)
      .logLevel(Vega.Info)
      .renderer("svg")
      .initialize(container)
      .runAsync()
}
