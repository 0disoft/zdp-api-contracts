import {expect,test} from 'bun:test';
import {buildOpenApi31Document} from '../src/api-export-plan/openapi';
import {parse} from 'yaml';

test('implemented workflow metadata does not assert deployment or end-to-end TLS proof',async()=>{
  const w=parse(await Bun.file('contracts/apis/core-api/doubloon-approval-workflow.yaml').text()).doubloon_approval_workflow;
  expect(w.status).toBe('internal_staging_implemented_default_disabled');
  expect(w.default_enabled).toBe(false);
  expect(w.deployment_activation).toBe('not_asserted');
  expect(w.base_url).toBeNull();
  expect(w.public_path).toBeNull();
  expect(w.sdk_operation_generated).toBe(false);
  expect(w.supported_internal_paths).toEqual({create:'/internal/admin/doubloon/proposals',complete:'/internal/admin/doubloon/complete',status:'/internal/admin/doubloon/status'});
  expect(w.implementation_evidence).toMatchObject({
    conformance:'scoped_local_evidence_not_full_contract_certification',
    integration_transport:'stdio_http_adapter_with_disposable_postgres',
    browser_backend:'synthetic_response_fixtures',
    deployed_browser_to_core_tls_verified:false,
  });
  expect(await Bun.file(w.implementation_evidence.documentation).exists()).toBe(true);
});

test('workflow exports additive closed DTOs while preserving consent-only confirm',async()=>{
  const result=await buildOpenApi31Document(process.cwd());
  expect(result.ok,JSON.stringify(result)).toBe(true);
  const schemas=result.document!.components.schemas;
  const workflow=parse(await Bun.file('contracts/apis/core-api/doubloon-approval-workflow.yaml').text()).doubloon_approval_workflow;
  for(const pair of Object.values(workflow.operations) as string[][])for(const name of pair){
    expect(schemas[name]).toBeDefined();
    expect(schemas[name]!.additionalProperties).toBe(false);
    expect(JSON.stringify(result.document!.paths)).not.toContain(name);
  }
  const create=schemas.DoubloonProposalCreateRequest!;
  expect(create.required).toEqual(['command_key','transaction_json','evidence_json']);
  for(const field of ['requester_id','tenant','policy_ref','approval_revision','receipt_ref','actor_id'])expect(create.properties).not.toHaveProperty(field);
  expect(schemas.DoubloonApprovalCompleteRequest!.properties).toMatchObject({accepted:{type:'boolean',enum:[true]}});
  expect(schemas.DoubloonApprovalCompleteRequest!.required).toContain('command_key');
  for(const name of ['DoubloonProposalCreateResponse','DoubloonApprovalCompleteResponse','DoubloonApprovalStatusResponse']){
    expect(schemas[name]!.properties).toMatchObject({execution_authorized:{type:'boolean',enum:[false]}});
    expect(schemas[name]!.properties).not.toHaveProperty('password');
  }
  expect(schemas.DoubloonApprovalCompleteResponse!.required).toContain('approval_revision');
  expect(schemas.DoubloonApprovalStatusResponse).toMatchObject({properties:{state:{enum:workflow.result_status.current_state}}});
  expect(workflow.compatibility.existing_confirm).toBe('consent_only_never_implicitly_issue');
  expect(workflow.result_status.accessible_after_completion).toBe(true);
  expect(workflow.default_enabled).toBe(false);
});

test('workflow separates durable command recovery from current approval validity',async()=>{
  const w=parse(await Bun.file('contracts/apis/core-api/doubloon-approval-workflow.yaml').text()).doubloon_approval_workflow;
  expect(w.idempotency.scope).toEqual(['tenant','authenticated_actor','operation','command_key']);
  expect(w.idempotency.same_key_different_content).toBe('conflict_409');
  expect(w.idempotency.replay_validity).toBe('historical_command_result_not_current_approval_authority_use_status');
  expect(w.idempotency.replay_assurance).toBe('no_password_reverification_no_new_consent_or_issue');
  expect(w.idempotency.complete_fingerprint).toBe('receipt_ref_confirmed_binding_accepted_excluding_password');
  expect(w.atomicity.complete).toEqual(['consent_audit','approval_record','approval_actors','approval_head','issuance_audit','command_result']);
  expect(w.pilot.quorum).toBe('exactly_one_reject_other_policies_never_downgrade');
  expect(w.security.complete_permission).toContain('not_requester');
  expect(w.security.status_permission).toContain('current_exact_tenant');
  expect(w.result_status.missing_or_out_of_scope).toBe('same_403_no_existence_disclosure');
});
test('Doubloon consent exports closed schemas without activating routes',async()=>{
  const result=await buildOpenApi31Document(process.cwd());
  expect(result.ok,JSON.stringify(result)).toBe(true);
  const schemas=result.document!.components.schemas;
  expect(schemas.DoubloonConsentConfirmRequest).toMatchObject({additionalProperties:false,required:['receipt_ref','confirmed_binding','accepted','password'],properties:{accepted:{type:'boolean',enum:[true]}}});
  expect(schemas.DoubloonConsentConfirmRequest!.properties).not.toHaveProperty('actor_id');
  expect(schemas.DoubloonConsentConfirmRequest!.properties).not.toHaveProperty('transaction_json');
  expect(schemas.DoubloonConsentReviewResponse!.required).toContain('evidence_json');
  expect(schemas.DoubloonConsentConfirmResponse).toMatchObject({properties:{execution_authorized:{type:'boolean',enum:[false]}}});
  expect(JSON.stringify(result.document!.paths)).not.toContain('DoubloonConsent');
  const policy=parse(await Bun.file('contracts/apis/core-api/doubloon-consent.yaml').text()).doubloon_consent;
  expect(policy.path).toBeNull();expect(policy.runtime_enabled).toBe(false);
  for(const pair of Object.values(policy.operations) as string[][])for(const name of pair)expect(schemas[name]).toBeDefined();
});
