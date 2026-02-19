import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { IACryModule } from './iacry.module';
import { IACryService } from './iacry.service';
import { Options } from './interfaces/module.options';
import { OptionsFactory } from './interfaces/module-options.factory';
import { Effect } from './interfaces/policy';

class TestOptionsFactory implements OptionsFactory {
  createOptions(): Options {
    return { policies: [] } as Options;
  }
}

describe('IACryModule', () => {
  describe('forRoot', () => {
    it('should return a DynamicModule with correct module reference', () => {
      const result = IACryModule.forRoot({} as Options);
      expect(result.module).toBe(IACryModule);
    });

    it('should include IACryService in exports', () => {
      const result = IACryModule.forRoot({} as Options);
      expect(result.exports).toContain(IACryService);
    });

    it('should compile and resolve IACryService with empty options', async () => {
      const module = await Test.createTestingModule({
        imports: [IACryModule.forRoot({} as Options)],
      }).compile();

      const service = module.get<IACryService>(IACryService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(IACryService);
    });

    it('should compile with policies option', async () => {
      const policies = [
        {
          Effect: Effect.ALLOW,
          Action: 'book:read',
          Resource: '*',
        },
      ];

      const module = await Test.createTestingModule({
        imports: [IACryModule.forRoot({ policies } as Options)],
      }).compile();

      const service = module.get<IACryService>(IACryService);
      expect(service).toBeDefined();
    });
  });

  describe('forRootAsync', () => {
    it('should compile and resolve IACryService with useFactory', async () => {
      const module = await Test.createTestingModule({
        imports: [
          IACryModule.forRootAsync({
            useFactory: () => ({ policies: [] }) as Options,
          }),
        ],
      }).compile();

      const service = module.get<IACryService>(IACryService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(IACryService);
    });

    it('should compile with useClass', async () => {
      const module = await Test.createTestingModule({
        imports: [
          IACryModule.forRootAsync({
            useClass: TestOptionsFactory,
          }),
        ],
      }).compile();

      const service = module.get<IACryService>(IACryService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(IACryService);
    });
  });
});
