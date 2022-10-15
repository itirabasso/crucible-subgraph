import { dataSource, log, store } from "@graphprotocol/graph-ts";
import { AludelFactory, ProgramAdded, ProgramDelisted, TemplateAdded, TemplateUpdated } from "../generated/AludelFactory/AludelFactory";
import { RewardProgram, Template } from "../generated/schema";
import { AludelV15Template } from "../generated/templates";
import { AludelV15 } from "../generated/templates/AludelV15Template/AludelV15";
import { getAludelId, getIdFromAddress } from "./utils";

export function handleProgramAdded(event: ProgramAdded): void {
  let aludelAddress = event.params.program
  AludelV15Template.create(aludelAddress)

  let aludelId = getAludelId(aludelAddress)


  let factory = AludelFactory.bind(dataSource.address())
  let data = factory.try_programs(aludelAddress)
  if (data.reverted) {
    log.error("handleInstanceAdded: failed get program data: {}", [aludelAddress.toHexString()]);
    return;
  }

  let rewardProgram = new RewardProgram(aludelId)

  let aludel = AludelV15.bind(aludelAddress)
  let owner = aludel.try_owner()
  if (owner.reverted) {
    log.error("handleInstanceAdded: failed get program's owner: {}", [aludelAddress.toHexString()]);
  } else {
    rewardProgram.owner = owner.value;
  }

  rewardProgram.template = getIdFromAddress(data.value.template)
  rewardProgram.stakingTokenUrl = data.value.stakingTokenUrl
  rewardProgram.startTime = data.value.startTime
  rewardProgram.name = data.value.name
  rewardProgram.save()
 }

// we need a remove instance / delist aludel event emitted
 export function handleProgramDelisted(event: ProgramDelisted): void {
  let aludelAddress = event.params.program
  // AludelV15Template.create(aludelAddress)
  let aludelId = getAludelId(aludelAddress)
  log.warning("delisting program {}", [aludelAddress.toString(), aludelId.toString()])
  store.remove('RewardProgram', aludelId)
 }

export function handleTemplateAdded(event: TemplateAdded): void {
  let id = getIdFromAddress(event.params.template)
  
  let template = new Template(id)

  let factory = AludelFactory.bind(dataSource.address())

  let data = factory.try_getTemplate(event.params.template)
  if (data.reverted) {
    log.error("handleInstanceAdded: failed get template data", []);
    return;
  }

  template.disabled = data.value.disabled
  template.name = data.value.name
  template.save()
}
export function handleTemplateChanged(event: TemplateUpdated): void {
  let id = getIdFromAddress(event.params.template);
  let template = Template.load(id)
  if (template === null) {
    log.error('handleTemplateUpdate: cannot load template with id', [id])
    return;
  }

  template.disabled = event.params.disabled
  template.save()
}