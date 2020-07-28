import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DecoratorError } from '../errors/decorator.error';
import { CoreService } from '../iacry.service';
import { extractDynamicIdentifier as actionExtractor } from './action';
import { extractDynamicIdentifier as resourceExtractor } from './resource';
import { extractDynamicIdentifier as principalExtractor } from './principal';

/**
 * @use import { IACryAction, IACryResource, IACryPrincipal, IACryFirewallGuard } from './iacry';
 *
 *      @IACryAction('book:update')
 *      @IACryResource('book:{params.id}') [OPTIONAL]
 *      @IACryPrincipal()
 *      @UseGuards(JwtAuthGuard, IACryFirewallGuard)
 *      @Post('book/:id')
 *      async update(@Request() req) {  }
 */
@Injectable()
export class FirewallGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly service: CoreService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = actionExtractor(context.getHandler(), context);
    const principal = principalExtractor(context.getHandler(), context);
    const resource = resourceExtractor(context.getHandler(), context);

    if (!action || !principal) {
      throw new DecoratorError(
        'You must decorate your controller with at least @IACryAction and @IACryResource decorators',
      );
    }

    return this.service.isGranted(
      action,
      principal,
      resource || CoreService.ANY,
    );
  }
}
