import {expect,test} from 'bun:test';
import {buildOpenApi31Document} from '../src/api-export-plan/openapi';
import {parse} from 'yaml';
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
