import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import {
  Approval,
  ApprovalForAll,
  InstanceAdded,
  InstanceRemoved,
  Transfer
} from "../generated/CrucibleFactory/CrucibleFactory"

import {Counters, CrucibleEntity} from "../generated/schema"
import { CrucibleTemplate } from "../generated/templates";
import { Crucible } from "../generated/templates/CrucibleTemplate/Crucible";

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (!entity) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner
  // entity.approved = event.params.approved

  // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.baseURI(...)
  // - contract.create(...)
  // - contract.create(...)
  // - contract.create2(...)
  // - contract.create2(...)
  // - contract.getApproved(...)
  // - contract.getTemplate(...)
  // - contract.instanceAt(...)
  // - contract.instanceCount(...)
  // - contract.isApprovedForAll(...)
  // - contract.isInstance(...)
  // - contract.name(...)
  // - contract.ownerOf(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenByIndex(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.tokenURI(...)
  // - contract.totalSupply(...)
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleInstanceAdded(event: InstanceAdded): void {


  // let entity = new CrucibleEntity(event.params.instance.toHex());
  // entity.timestamp = event.block.timestamp
  // entity.hash = event.transaction.hash
  // entity.owner = event.transaction.from
  // entity.save()
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
