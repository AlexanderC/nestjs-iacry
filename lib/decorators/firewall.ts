import { applyDecorators } from '@nestjs/common';
import { Action, Resource, Principal } from '../interfaces/policy';
import { Action as ActionDecorator } from './action';
import { Resource as ResourceDecorator } from './resource';
import { Principal as PrincipalDecorator } from './principal';

export interface FirewallOptions {
  action?: Action; // default "book:update" for BookController.update()
  resource?: Resource; // default "*"
  principal?: Principal; // default REQUEST_USER
}

/**
 * @use import { IACryFirewall, IACryFirewallGuard } from './iacry';
 *
 *      @IACryFirewall()
 *      @UseGuards(JwtAuthGuard, IACryFirewallGuard)
 *      @Post('book/:id')
 *      async update(@Request() req) {  }
 */
export function Firewall(options: FirewallOptions = {}) {
  return applyDecorators(
    ActionDecorator(options.action),
    PrincipalDecorator(options.principal),
    ...(options.resource ? [ResourceDecorator(options.resource)] : []),
  );
}
