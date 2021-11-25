import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  InstanceAdded,
  InstanceRemoved,
  Transfer
} from "../generated/CrucibleFactory/CrucibleFactory"

import {Counters, CrucibleEntity} from "../generated/schema"
import { CrucibleTemplate } from "../generated/templates";
import { getCrucibleIdFromTokenId } from "./utils";


export function handleInstanceAdded(event: InstanceAdded): void {

  CrucibleTemplate.create(event.params.instance)
}

export function handleInstanceRemoved(event: InstanceRemoved): void {}

function isAddressZero(address: Address): boolean {
  return address.equals(Address.fromString("0x0x0000000000000000000000000000000000000000"))
}

function createCrucible(event: Transfer): void {
  // find a way to create an initialization method
  let counter = Counters.load("crucible-counter")
  if (counter == null) {
    counter = new Counters("crucible-counter")
    counter.count = 0
  }
  counter.count = counter.count + 1
  counter.save()

  let to = event.params.to
  let tokenId = event.params.tokenId

  let entity = new CrucibleEntity(tokenId.toHexString().toLowerCase());
  entity.timestamp = event.block.timestamp
  entity.owner = to
  entity.index = counter.count
  // 
  entity.blockNumber = event.block.number
  entity.txhash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: Transfer): void {
  let from = event.params.from
  let to = event.params.to
  let tokenId = event.params.tokenId

  // creation
  if (isAddressZero(from)) {
    // createCrucible(event)
  }
  // transfer
  if (!isAddressZero(to) && !isAddressZero(from)) {
    let id = getCrucibleIdFromTokenId(tokenId)
    log.warning('transfering crucible {} from {} to {}', [id, from.toHex(), to.toHex()])
    let crucible = CrucibleEntity.load(id)
    if (crucible != null) {
      crucible.owner = to      
      crucible.save()
    } else {
      log.error("crucibleTransfer: crucible {} not found", [id]);
    }
    
  }

}
