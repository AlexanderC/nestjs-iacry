import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { ValueProvider } from '@nestjs/common/interfaces';
import { Options } from './interfaces/module.options';
import { AsyncOptions } from './interfaces/module-async.options';
import { OptionsFactory } from './interfaces/module-options.factory';
import { CoreService } from './iacry.service';
import { IACRY_OPTIONS } from './constants';

@Global()
@Module({})
export class CoreModule {
  static forRoot(options?: Options): DynamicModule {
    const OptionsProvider: ValueProvider<Options> = {
      provide: IACRY_OPTIONS,
      useValue: options,
    };

    return {
      module: CoreModule,
      providers: [OptionsProvider, CoreService],
      exports: [CoreService],
    };
  }

  static forRootAsync(options: AsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: CoreModule,
      providers: [...providers, CoreService],
      imports: options.imports,
      exports: [CoreService],
    };
  }

  private static createAsyncProviders(options: AsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: AsyncOptions): Provider {
    if (options.useFactory) {
      return {
        name: IACRY_OPTIONS,
        provide: IACRY_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      name: IACRY_OPTIONS,
      provide: IACRY_OPTIONS,
      useFactory: async (optionsFactory: OptionsFactory) => {
        return optionsFactory.createOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
