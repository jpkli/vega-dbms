import { Transform as VegaTransform, ingest, inherits } from "vega"
import { DatabaseTable } from "./models"

export class VegaDbTransform extends VegaTransform {
  public readonly databaseTable: DatabaseTable
  public value: any
  public Definition: any
  public id: string

  constructor(arg: {
    id: string
    init?: any
    params?: any
    databaseTable?: DatabaseTable
  }) {
    super(arg.init ?? [], arg.params)
    this.id = arg.id
    this.databaseTable = arg.databaseTable
    this.value = []
    this.Definition = {
      type: this.id,
      metadata: { changes: true, source: true },
      params: [{ name: "query", type: "string", required: true }]
    }
  }

  public test (params) {
    VegaTransform.call(this, [], params)
  }

  public async transform (params: Record<string, any>, pulse: Record<string, any>) {
    const result = await this.databaseTable.runQuery(params.query)
    result.forEach(ingest)
    const out: Record<string, unknown> = pulse.fork(pulse.NO_FIELDS & pulse.NO_SOURCE)
    out.rem = this.value

    this.value = out.add = out.source = result

    return out
  }
}

export function ProtoVegaDbTransform(params) {
  VegaTransform.call(this, [], params);
}

ProtoVegaDbTransform.Definition = {
  type: "duckdb",
  metadata: { changes: true, source: true },
  params: [{ name: "query", type: "string", required: true }]
};

const prototype = inherits(ProtoVegaDbTransform, VegaTransform);

prototype.transform = async function(_, pulse) {
  console.log(_.query)
  const result = []
  result.forEach(ingest);

  const out = pulse.fork(pulse.NO_FIELDS & pulse.NO_SOURCE);
  out.rem = this.value;

  this.value = out.add = out.source = result;

  return out;
};
