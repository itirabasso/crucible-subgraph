import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import {
  InstanceAdded,
  InstanceRemoved,
  Transfer
} from "../generated/CrucibleFactory/CrucibleFactory"

import {Counters, CrucibleEntity} from "../generated/schema"
import { CrucibleTemplate } from "../generated/templates";
import { Crucible } from "../generated/templates/CrucibleTemplate/Crucible";


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
    createCrucible(event)
  }
  // transfer
  if (!isAddressZero(to) && !isAddressZero(from)) {
    let entity = CrucibleEntity.load(tokenId.toHexString().toLowerCase())
    if (entity != null) {
      entity.owner = to      
      entity.save()
    }
    
  }

}
