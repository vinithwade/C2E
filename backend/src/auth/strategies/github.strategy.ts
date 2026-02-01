import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID') || 'dummy';
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET') || 'dummy';
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3000/auth/github/callback';
    
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    const { id, username, displayName, photos, emails } = profile;
    const user = {
      providerId: id,
      email: emails?.[0]?.value || `${username}@github`,
      name: displayName || username,
      avatar: photos?.[0]?.value,
      provider: 'GITHUB',
    };

    done(null, user);
  }
}
