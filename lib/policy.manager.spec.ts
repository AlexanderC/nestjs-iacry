import 'reflect-metadata';
import { PolicyManager } from './policy.manager';
import { PolicyStorage } from './interfaces/policy-storage';
import { Effect, PolicyInterface, PrincipalObject } from './interfaces/policy';
import { CoreHelper } from './helpers/core';

function createMockStorage(): jest.Mocked<PolicyStorage> {
  return {
    readonly: false,
    fetch: jest.fn(),
    save: jest.fn(),
    add: jest.fn(),
    purge: jest.fn(),
    fetchBySid: jest.fn(),
    saveBySid: jest.fn(),
  };
}

// PolicyManager is abstract (extends CoreHelper which is abstract), so we create a concrete subclass
class TestPolicyManager extends PolicyManager {
  constructor(storage?: PolicyStorage) {
    super(storage);
  }
}

describe('PolicyManager', () => {
  let manager: TestPolicyManager;
  let mockStorage: jest.Mocked<PolicyStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    manager = new TestPolicyManager(mockStorage);
  });

  describe('setStorage', () => {
    it('should replace the storage and return self', () => {
      const newStorage = createMockStorage();
      const result = manager.setStorage(newStorage);
      expect(result).toBe(manager);
    });
  });

  describe('attach', () => {
    it('should call storage.add with normalized principal', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      const policies: PolicyInterface[] = [
        { Effect: Effect.ALLOW, Action: 'book:read' },
      ];
      mockStorage.add.mockResolvedValue(1);

      const result = await manager.attach(principal, policies);

      expect(mockStorage.add).toHaveBeenCalledWith(principal, policies);
      expect(result).toBe(1);
    });

    it('should handle string principal', async () => {
      const policies: PolicyInterface[] = [
        { Effect: Effect.ALLOW, Action: 'book:read' },
      ];
      mockStorage.add.mockResolvedValue(1);

      await manager.attach('user:1', policies);

      expect(mockStorage.add).toHaveBeenCalledWith(
        { entity: 'user', id: '1' },
        policies,
      );
    });
  });

  describe('reset', () => {
    it('should call storage.save when policies provided', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      const policies: PolicyInterface[] = [
        { Effect: Effect.ALLOW, Action: 'book:read' },
      ];
      mockStorage.save.mockResolvedValue(1);

      const result = await manager.reset(principal, policies);

      expect(mockStorage.save).toHaveBeenCalledWith(principal, policies);
      expect(result).toBe(1);
    });

    it('should call storage.purge when no policies provided', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      mockStorage.purge.mockResolvedValue(0);

      const result = await manager.reset(principal);

      expect(mockStorage.purge).toHaveBeenCalledWith(principal);
      expect(result).toBe(0);
    });
  });

  describe('retrieve', () => {
    it('should fetch and decode string policies', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      const policy: PolicyInterface = {
        Effect: Effect.ALLOW,
        Action: 'book:read',
      };
      const encoded = JSON.stringify(policy);
      mockStorage.fetch.mockResolvedValue([encoded]);

      const result = await manager.retrieve(principal);

      expect(mockStorage.fetch).toHaveBeenCalledWith(principal);
      expect(result).toEqual([policy]);
    });

    it('should return PolicyInterface objects as-is', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      const policy: PolicyInterface = {
        Effect: Effect.ALLOW,
        Action: 'book:read',
      };
      mockStorage.fetch.mockResolvedValue([policy]);

      const result = await manager.retrieve(principal);

      expect(result).toEqual([policy]);
    });
  });

  describe('retrieveBySid', () => {
    it('should fetch by sid', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      const policy: PolicyInterface = {
        Sid: 'testPolicy',
        Effect: Effect.ALLOW,
        Action: 'book:read',
      };
      mockStorage.fetchBySid.mockResolvedValue([policy]);

      const result = await manager.retrieveBySid('testPolicy', principal);

      expect(mockStorage.fetchBySid).toHaveBeenCalledWith(
        'testPolicy',
        principal,
      );
      expect(result).toEqual([policy]);
    });
  });

  describe('upsertBySid', () => {
    it('should call storage.saveBySid', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      const policies: PolicyInterface[] = [
        { Sid: 'testPolicy', Effect: Effect.ALLOW, Action: 'book:read' },
      ];
      mockStorage.saveBySid.mockResolvedValue(1);

      const result = await manager.upsertBySid(
        'testPolicy',
        principal,
        policies,
      );

      expect(mockStorage.saveBySid).toHaveBeenCalledWith(
        'testPolicy',
        principal,
        policies,
      );
      expect(result).toBe(1);
    });
  });

  describe('grant', () => {
    it('should construct a policy and call attach with Effect.ALLOW by default', async () => {
      const principal: PrincipalObject = { entity: 'user', id: 1 };
      mockStorage.add.mockResolvedValue(1);

      const result = await manager.grant('book:read', principal, 'book:33');

      expect(mockStorage.add).toHaveBeenCalledWith(principal, [
        expect.objectContaining({
          Effect: Effect.ALLOW,
          Action: 'book:read',
          Resource: 'book:33',
          Principal: principal,
        }),
      ]);
      expect(result).toBe(1);
    });
  });
});
