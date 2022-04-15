import {
  log,
} from "@graphprotocol/graph-ts";
import { CrucibleEntity } from "../generated/schema";
import {getCrucibleId } from "./utils";

import {
  PayFeeCall
} from "../generated/Minter/Minter";

export function handleFeePayment(call: PayFeeCall): void {
  let params = call.inputValues
  if (params.length < 1) {
    log.error('Minter: invalid amount of params', [])
    return
  }
  if (call.outputValues.length < 1) {
    log.error('Minter: invalid amount of params', [])
    return
  }
  if (call.outputValues[0].value.toBoolean() == false) {
    log.error('Minter: return value is false', [])
    return
  }

  let id = getCrucibleId(params[0].value.toAddress())
  let crucible = CrucibleEntity.load(id)
  if (crucible == null) {
    log.error('minter: unable to load crucible with id {}', [id.toString()])
    return
  }
  crucible.level = 'Pro'
  crucible.save()
}
