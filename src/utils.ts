import {
  Address,
  Bytes,
  crypto,
  ByteArray,
  BigInt,
  Value,
  log,
} from "@graphprotocol/graph-ts";
import { Crucible, Lock, Stake } from "../generated/schema";

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return Bytes.fromUint8Array(out);
}

export function getLockId(
  crucible: Address,
  delegate: Address,
  token: Address
): string {
  // onchain lockID
  let lockID = crypto.keccak256(concat(delegate, token));
  // entity id = lockID-crucible_address
  let id = lockID.toHexString() + "-" + crucible.toHexString();
  return id;
}

export function getStakeId(lock: Lock, index: BigInt): string {
  return lock.id + "-stake-" + index.toString();
}
export function getUnstakeId(lock: Lock, index: BigInt): string {
  return lock.id + "-unstake-" + index.toString();
}

export function getCrucibleId(address: Address): string {
  return address.toHexString();
}

export function getCrucibleIdFromTokenId(tokenId: BigInt): string {
  return tokenId.toHexString().slice(-42);
}

export function getAludelId(address: Address): string {
  return address.toHexString();
}

export function getRewardId(
  crucible: Address,
  aludel: Address,
  token: Address
): string {
  return (
    crucible.toHexString() +
    "-" +
    aludel.toHexString() +
    "-" +
    token.toHexString()
  );
}

export function createLock(
  id: string,
  delegate: Address,
  token: Address,
  crucible: Crucible
): Lock {
  log.warning("creating lock: {}", [id]);
  let lock = new Lock(id);
  lock.delegate = delegate;
  lock.token = token;
  lock.crucible = crucible.id;
  return lock;
}

export function createStake(
  id: string,
  amount: BigInt,
  timestamp: BigInt,
  lock: Lock
): Stake {
  let stake = new Stake(id);
  stake.amount = amount;
  stake.timestamp = timestamp;
  stake.lock = lock.id;
  return stake;
}
