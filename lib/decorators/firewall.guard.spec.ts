import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { Controller, Get, UseGuards, ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { IACryService } from '../iacry.service';
import { Effect } from '../interfaces/policy';
import { IACRY_OPTIONS } from '../constants';
import { Firewall } from './firewall';
import { FirewallGuard } from './firewall.guard';

const ACTION = 'test:check';
const RESOURCE = { entity: 'checkable', id: 33 };
const PRINCIPAL = { entity: 'user', id: 1 };
const PRINCIPAL_ENTITY = {
  // this will mimic @Entity behavior
  ...PRINCIPAL,
  toString: () => `${PRINCIPAL.entity}:${PRINCIPAL.id}`,
};
const POLICY = {
  Effect: Effect.ALLOW,
  Action: ACTION,
  Resource: `${RESOURCE.entity}:*`,
  Principal: `${PRINCIPAL.entity}:${PRINCIPAL.id}`,
};
const ABSTAIN_POLICY = {
  Effect: Effect.ALLOW,
  Action: ACTION,
  Resource: `${RESOURCE.entity}:*`,
  Principal: `${PRINCIPAL.entity}:!${PRINCIPAL.id}`,
};

@Controller()
export class TestController {
  @Firewall({ resource: RESOURCE })
  @UseGuards(FirewallGuard)
  @Get('test/check')
  check(): void {}
}

async function firewall(
  policy,
): Promise<{ guard: FirewallGuard; context: ExecutionContext }> {
  const moduleRef = await Test.createTestingModule({
    controllers: [TestController],
    providers: [
      {
        provide: IACRY_OPTIONS,
        useValue: { policies: [policy] },
      },
      IACryService,
    ],
  }).compile();

  const context = createMock<ExecutionContext>();
  const ctrl = moduleRef.get<TestController>(TestController);
  const service = moduleRef.get<IACryService>(IACryService);

  const [Guard] = Reflect.getMetadata(GUARDS_METADATA, ctrl.check);
  context.getHandler.mockReturnValue(ctrl.check);
  context.getClass.mockReturnValue(<any>ctrl.constructor);
  context.switchToHttp().getRequest.mockReturnValue({ user: PRINCIPAL_ENTITY });

  return { guard: new Guard(service), context };
}

describe('FirewallGuard', () => {
  it('should return truthy for a proper policy', async () => {
    const { guard, context } = await firewall(POLICY);
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should return falsy for an abstain policy', async () => {
    const { guard, context } = await firewall(ABSTAIN_POLICY);
    expect(await guard.canActivate(context)).toBe(false);
  });
});
