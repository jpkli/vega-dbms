import duckdb from "duckdb"
import { TableSchema, DatabaseTable } from "./models"

export type DbRows = Record<string, unknown>[]

export enum DuckDbType {
  BIGINT = "bigint",
  BOOLEAN = "boolean",
  BLOB = "blob",
  DATE = "date",
  DOUBLE = "double",
  INTEGER = "integer",
  REAL = "real",
  SMALLINT = "smallint",
  TIMESTAMP = "timestamp",
  TINYINT = "tinyint",
  VARCHAR = "varchar"
}

export const DuckDbTypes = Object.values(DuckDbType)

export const isDuckDbType = (
	type: string,
): type is DuckDbType =>
  DuckDbTypes.includes(type as DuckDbType)

export type DuckdbNumericFunction =
  | "COUNT"
  | "AVG"
  | "SUM"
  | "MIN"
  | "MAX"
  | "ABS"
  | "MEDIAN"

export interface IFieldMetric {
  field: string,
  metric: DuckdbNumericFunction
  as?: string
}

export interface IDatabaseTable {
  name?: string
  schema?: TableSchema
}

export type FieldInfo = {
  Field: string,
  Type: DuckDbType | string,
  Key: string | null
  Default: any | null
  Extra: any | null
}

export class DuckDbTable implements DatabaseTable {
  public name: string
  public db: duckdb.Database
  public schema: TableSchema

  constructor (params: IDatabaseTable) {
    this.name = (params.name === undefined)
      ? Math.random().toString(36).substring(7)
      : params.name

    this.db = new duckdb.Database(":memory:")
    this.schema = params.schema
  }

  public async create(schema?: TableSchema): Promise<DuckDbTable> {
    if (schema !== undefined) {
      this.schema = schema
    }

    return new Promise((resolve, reject) => {
      this.db.run(`CREATE TABLE ${this.name} (${this.schemaToString(this.schema)});`, (err) => {
        console.log("create table")
        if (err) {
          reject(err)
        } else {
          resolve(this)
        }
      })
    })
  }

  public async describe() {
    return new Promise((resolve, reject) => {
      this.db.all(`DESCRIBE ${this.name};`, (err, schema) => {
        console.log("create table")
        if (err) {
          reject(err)
        } else {
          resolve(schema)
        }
      })
    })
  }

  public async importDatafile (filePath: string): Promise<DuckDbTable> {
    return new Promise((resolve, reject) => {
      console.log("import csv file")
      if (this.schema !== undefined && this.schema.size > 0) {
        this.db.run(
          `COPY ${this.name} FROM '${filePath}' ( AUTO_DETECT TRUE );`,
          (err) => {
            if (err) {
              reject(err)
            } else {
              resolve(this)
            }
          }
        )
      } else {
        this.db.run(
          `CREATE TABLE ${this.name} AS SELECT * FROM read_csv_auto('${filePath}');`,
          (err) => {
            if (err) {
              reject(err)
            } else {
              resolve(this)
            }
          }
        )
      }

    })
  }

  public async getRows (): Promise<DbRows> {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * from ${this.name}`, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }


  public async runQuery(sql: string, params?: any): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error, result: Record<string, unknown>[],) => {
        if (err) {
          reject(err)
        } else {
           resolve(result)
        }
      })
    })
  }

  private schemaToString (schema: TableSchema): string {
    return Object.keys(schema).map(field => {
      return `${field} ${schema.get(field)}`
    }).join()
  }

}
