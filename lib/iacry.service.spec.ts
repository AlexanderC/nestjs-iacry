import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { IACryService } from './iacry.service';
import { Options } from './interfaces/module.options';
import { Effect } from './interfaces/policy';
import {
  IACRY_OPTIONS,
  IS_ALLOWED,
  IS_ALLOWED_ANY,
  IS_ALLOWED_IMPLICIT,
} from './constants';

describe('IACryService', () => {
  let service: IACryService;

  async function createService(
    options: Partial<Options> = {},
  ): Promise<IACryService> {
    const module = await Test.createTestingModule({
      providers: [{ provide: IACRY_OPTIONS, useValue: options }, IACryService],
    }).compile();

    return module.get<IACryService>(IACryService);
  }

  describe('initialization', () => {
    it('should initialize with empty policies options', async () => {
      service = await createService({});
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(IACryService);
    });

    it('should initialize with global policies', async () => {
      service = await createService({
        policies: [
          {
            Effect: Effect.ALLOW,
            Action: 'book:read',
            Resource: '*',
            Principal: '*',
          },
        ],
      });
      expect(service).toBeDefined();
    });
  });

  describe('isGranted', () => {
    beforeEach(async () => {
      service = await createService({
        policies: [
          {
            Effect: Effect.ALLOW,
            Action: 'book:read',
            Resource: '*',
            Principal: 'user:1',
          },
        ],
      });
    });

    it('should return true when policy allows the action', async () => {
      const result = await service.isGranted('book:read', 'user:1', '*');
      expect(result).toBe(true);
    });

    it('should return false when no policies match', async () => {
      const result = await service.isGranted('book:delete', 'user:1', '*');
      expect(result).toBe(false);
    });

    it('should use isAllowedAny rule when specified', async () => {
      const result = await service.isGranted(
        'book:read',
        'user:1',
        '*',
        IS_ALLOWED_ANY,
      );
      expect(result).toBe(true);
    });

    it('should use isAllowedImplicit rule when specified', async () => {
      const result = await service.isGranted(
        'book:write',
        'user:1',
        '*',
        IS_ALLOWED_IMPLICIT,
      );
      expect(result).toBe(true);
    });

    it('should throw on unrecognized firewall rule', async () => {
      await expect(
        service.isGranted('book:read', 'user:1', '*', 'invalidRule'),
      ).rejects.toThrow('Unrecognized firewall rule: invalidRule');
    });

    it('should default resource to "*" when not provided', async () => {
      const result = await service.isGranted('book:read', 'user:1');
      expect(result).toBe(true);
    });
  });
});
