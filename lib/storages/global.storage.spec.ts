import 'reflect-metadata';
import { GlobalStorage } from './global.storage';
import { Effect, PolicyInterface } from '../interfaces/policy';
import { BaseError } from '../errors/iacry.error';

describe('GlobalStorage', () => {
  const principal = { entity: 'user', id: 1 };

  let storage: GlobalStorage;

  beforeEach(() => {
    storage = new GlobalStorage();
  });

  it('readonly should be true', () => {
    expect(storage.readonly).toBe(true);
  });

  it('fetch returns all policies regardless of principal', async () => {
    const policies: Array<string | PolicyInterface> = [
      { Effect: Effect.ALLOW, Action: 'book:read' },
      'user:*',
    ];
    storage = new GlobalStorage(policies);

    const result = await storage.fetch(principal);
    expect(result).toEqual(policies);

    const otherPrincipal = { entity: 'admin', id: 99 };
    const result2 = await storage.fetch(otherPrincipal);
    expect(result2).toEqual(policies);
  });

  it('fetchBySid returns empty array', async () => {
    storage = new GlobalStorage([
      { Effect: Effect.ALLOW, Action: 'book:read' },
    ]);

    const result = await storage.fetchBySid('some-sid', principal);
    expect(result).toEqual([]);
  });

  it('save replaces all policies', async () => {
    const initial: Array<string | PolicyInterface> = ['old:policy'];
    storage = new GlobalStorage(initial);

    const newPolicies: Array<string | PolicyInterface> = [
      { Effect: Effect.DENY, Action: 'book:delete' },
      'admin:*',
    ];

    const count = await storage.save(principal, newPolicies);
    expect(count).toBe(2);
    expect(storage.policies).toEqual(newPolicies);
  });

  it('add appends to existing policies', async () => {
    const initial: Array<string | PolicyInterface> = ['existing:policy'];
    storage = new GlobalStorage(initial);

    const additional: Array<string | PolicyInterface> = [
      { Effect: Effect.ALLOW, Action: 'book:create' },
    ];

    const count = await storage.add(principal, additional);
    expect(count).toBe(1);
    expect(storage.policies).toEqual([...initial, ...additional]);
  });

  it('purge clears all policies and returns removed count', async () => {
    const policies: Array<string | PolicyInterface> = [
      'policy:one',
      'policy:two',
      'policy:three',
    ];
    storage = new GlobalStorage(policies);

    const removed = await storage.purge(principal);
    expect(removed).toBe(3);
    expect(storage.policies).toEqual([]);
  });

  it('saveBySid throws BaseError', () => {
    expect(() => storage.saveBySid('sid', principal, [])).toThrow(BaseError);
    expect(() => storage.saveBySid('sid', principal, [])).toThrow(
      'PolicyInterface Storage method saveBySid() invocation not allowed',
    );
  });
});
