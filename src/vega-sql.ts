import { Transforms, AggregateTransform } from "vega"

export const vegaTransformToSql = (
  tableName: string,
  transform: Transforms
) => {
  if (transform.type === "aggregate") {
    return aggregateTransformToSql(tableName, transform)
  }
}

export const aggregateTransformToSql = (tableName: string, transform: AggregateTransform) => {
    const groupby = (transform.groupby as string[])
    const selectionList = groupby.slice()
    for (const [index, field] of (transform.fields as string[]).entries()) {
      const opt: string = transform.ops[index]
      const out: string = transform.as[index]
      selectionList.push(field === null ? `${opt}(*) as ${out}` : `${opt}(${field}) as ${out}`)
    }

    const sql = [
        `SELECT ${selectionList.join(",")}`,
        `FROM ${tableName}`,
        `GROUP BY ${groupby.join(",")}`
    ].join(" ")

    return `'${sql}'`
}