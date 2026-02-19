import { TypeOrmStorage } from './typeorm.storage';
import { Effect, PrincipalObject, PolicyInterface } from '../interfaces/policy';

function createMockRepository() {
  return {
    find: jest.fn().mockResolvedValue([]),
    save: jest
      .fn()
      .mockImplementation((entities: any[]) => Promise.resolve(entities)),
    delete: jest.fn().mockResolvedValue({ affected: 0 }),
    create: jest.fn().mockImplementation((data: any) => data),
  };
}

const PRINCIPAL: PrincipalObject = { entity: 'user', id: '1' };
const WILDCARD_PRINCIPAL: PrincipalObject = { entity: '*', id: '*' };
const POLICY: PolicyInterface = {
  Effect: Effect.ALLOW,
  Action: 'book:create',
};
const POLICY_WITH_SID: PolicyInterface = {
  Sid: 'test-policy',
  Effect: Effect.ALLOW,
  Action: 'book:update',
};

describe('TypeOrmStorage', () => {
  let storage: TypeOrmStorage;
  let mockRepo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    storage = new TypeOrmStorage(mockRepo);
  });

  it('should not be readonly', () => {
    expect(storage.readonly).toBe(false);
  });

  it('should throw TypeError for invalid repository', () => {
    const invalid = new TypeOrmStorage({ invalid: true });
    expect(() => invalid.repository).toThrow(TypeError);
  });

  describe('fetch', () => {
    it('should query with principal conditions and return policies', async () => {
      mockRepo.find.mockResolvedValue([
        { policy: '{"Effect":"Allow","Action":"book:create"}' },
        { policy: '{"Effect":"Deny","Action":"book:delete"}' },
      ]);

      const result = await storage.fetch(PRINCIPAL);
      expect(result).toHaveLength(2);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          expect.objectContaining({ entity: 'user', id: '1' }),
          expect.objectContaining({ entity: null, id: null }),
        ]),
        select: ['policy'],
      });
    });

    it('should query without entity/id filters for wildcard principal', async () => {
      mockRepo.find.mockResolvedValue([]);
      await storage.fetch(WILDCARD_PRINCIPAL);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: [{}],
        select: ['policy'],
      });
    });
  });

  describe('fetchBySid', () => {
    it('should include sid in query conditions', async () => {
      mockRepo.find.mockResolvedValue([]);
      await storage.fetchBySid('test-sid', PRINCIPAL);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          expect.objectContaining({ sid: 'test-sid', entity: 'user', id: '1' }),
        ]),
        select: ['policy'],
      });
    });
  });

  describe('save', () => {
    it('should delete existing policies then insert new ones', async () => {
      const result = await storage.save(PRINCIPAL, [POLICY]);

      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'user', id: '1' }),
      );
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'user',
          id: '1',
          sid: null,
        }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('add', () => {
    it('should insert without deleting existing policies', async () => {
      const result = await storage.add(PRINCIPAL, [POLICY, POLICY_WITH_SID]);

      expect(mockRepo.delete).not.toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe('saveBySid', () => {
    it('should delete by sid then insert new policies', async () => {
      await storage.saveBySid('test-policy', PRINCIPAL, [POLICY_WITH_SID]);

      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'user',
          id: '1',
          sid: 'test-policy',
        }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('purge', () => {
    it('should delete all policies for the principal', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 5 });
      const result = await storage.purge(PRINCIPAL);

      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'user', id: '1' }),
      );
      expect(result).toBe(5);
    });

    it('should delete all policies for wildcard principal', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 10 });
      const result = await storage.purge(WILDCARD_PRINCIPAL);

      expect(mockRepo.delete).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });

  describe('policy encoding', () => {
    it('should encode PolicyInterface objects to JSON when saving', async () => {
      await storage.save(PRINCIPAL, [POLICY]);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          policy: JSON.stringify(POLICY),
        }),
      );
    });

    it('should pass string policies through decode then re-encode', async () => {
      const stringPolicy = JSON.stringify(POLICY);
      await storage.add(PRINCIPAL, [stringPolicy]);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          policy: stringPolicy,
        }),
      );
    });

    it('should extract Sid from policy for the sid column', async () => {
      await storage.add(PRINCIPAL, [POLICY_WITH_SID]);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sid: 'test-policy',
        }),
      );
    });
  });
});
