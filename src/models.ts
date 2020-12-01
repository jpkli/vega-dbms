export type DataType =
  | "BIGINT"
  | "BOOLEAN"
  | "BLOB"
  | "DATE"
  | "DOUBLE"
  | "INTEGER"
  | "REAL"
  | "SMALLINT"
  | "TIMESTAMP"
  | "TINYINT"
  | "VARCHAR"

export type TableSchema = Map<string, DataType>

export interface DatabaseTable {
  name: string
  schema?: TableSchema
  runQuery: (sql: string, params?: any) => Promise<Record<string, unknown>[]>
}
