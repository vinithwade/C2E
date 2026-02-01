import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation (public endpoint)' })
  async acceptInvite(@Body() body: { token: string; password?: string; name?: string }) {
    return this.invitesService.acceptInvitePublic(body.token, body.password, body.name);
  }

  @Post('accept-authenticated')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept an invitation (authenticated user)' })
  async acceptInviteAuthenticated(
    @Body() body: { token: string },
    @CurrentUser() user: any,
  ) {
    return this.invitesService.acceptInvite(body.token, user.id);
  }
}
