import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InviteEditorDto } from '../projects/dto/project.dto';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { UserRole, AuthProvider } from '@prisma/client';

@Injectable()
export class InvitesService {
  private emailTransporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async createInvite(projectId: string, inviteDto: InviteEditorDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { creator: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Generate unique token
    const token = uuidv4();

    // Set expiry to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invite token
    const inviteToken = await this.prisma.inviteToken.create({
      data: {
        projectId,
        email: inviteDto.email,
        token,
        expiresAt,
      },
    });

    // Send invitation email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const inviteUrl = `${frontendUrl}/accept-invite?token=${token}`;

    await this.sendInviteEmail(inviteDto.email, {
      projectName: project.name,
      creatorName: project.creator.name || project.creator.email,
      inviteUrl,
    });

    return {
      message: 'Invitation sent successfully',
      token: inviteToken.token, // Only for testing, remove in production
    };
  }

  async acceptInvite(token: string, userId: string) {
    const inviteToken = await this.prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!inviteToken) {
      throw new NotFoundException('Invalid invite token');
    }

    if (inviteToken.used) {
      throw new BadRequestException('Invite token already used');
    }

    if (inviteToken.expiresAt < new Date()) {
      throw new BadRequestException('Invite token expired');
    }

    // Verify user email matches invite email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.email !== inviteToken.email) {
      throw new BadRequestException('Email does not match invitation');
    }

    // Create project editor relationship
    const projectEditor = await this.prisma.projectEditor.create({
      data: {
        projectId: inviteToken.projectId,
        editorId: userId,
        canView: true, // Default permissions
        canDownload: false,
        canOpenInEditor: true,
        canShare: false,
        joinedAt: new Date(),
      },
    });

    // Mark token as used
    await this.prisma.inviteToken.update({
      where: { id: inviteToken.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    const project = await this.prisma.project.findUnique({
      where: { id: inviteToken.projectId },
    });

    return {
      message: 'Invitation accepted',
      project,
      permissions: projectEditor,
    };
  }

  async acceptInvitePublic(token: string, password?: string, name?: string) {
    const inviteToken = await this.prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!inviteToken) {
      throw new NotFoundException('Invalid invite token');
    }

    if (inviteToken.used) {
      throw new BadRequestException('Invite token already used');
    }

    if (inviteToken.expiresAt < new Date()) {
      throw new BadRequestException('Invite token expired');
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: inviteToken.email },
    });

    // If user doesn't exist, create them with EDITOR role
    if (!user) {
      if (!password) {
        throw new BadRequestException('Password required to create account');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      user = await this.prisma.user.create({
        data: {
          email: inviteToken.email,
          passwordHash,
          name: name || inviteToken.email.split('@')[0],
          role: UserRole.EDITOR, // Set as EDITOR
          authProvider: AuthProvider.EMAIL,
          emailVerified: true,
        },
      });
    } else {
      // If user exists, update their role to EDITOR if they were CREATOR
      if (user.role === UserRole.CREATOR) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.EDITOR },
        });
      }
    }

    // Check if already added to project
    const existingEditor = await this.prisma.projectEditor.findFirst({
      where: {
        projectId: inviteToken.projectId,
        editorId: user.id,
      },
    });

    if (existingEditor) {
      throw new ConflictException('You are already a member of this project');
    }

    // Create project editor relationship
    const projectEditor = await this.prisma.projectEditor.create({
      data: {
        projectId: inviteToken.projectId,
        editorId: user.id,
        canView: true,
        canDownload: false,
        canOpenInEditor: true,
        canShare: false,
        joinedAt: new Date(),
      },
    });

    // Mark token as used
    await this.prisma.inviteToken.update({
      where: { id: inviteToken.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    const project = await this.prisma.project.findUnique({
      where: { id: inviteToken.projectId },
    });

    // Generate tokens for auto-login
    const tokens = await this.generateTokens(user.id);

    return {
      message: 'Invitation accepted',
      project,
      permissions: projectEditor,
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const refreshExpiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';

    const [accessToken, refreshTokenValue] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: refreshExpiresIn as jwt.SignOptions['expiresIn'],
      }),
    ]);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenValue,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private async sendInviteEmail(email: string, data: any) {
    const from = this.configService.get<string>('SMTP_FROM') || 'C2E <noreply@c2e.com>';

    const mailOptions = {
      from,
      to: email,
      subject: `You've been invited to collaborate on ${data.projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #0066FF; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>You've been invited to collaborate!</h2>
            <p><strong>${data.creatorName}</strong> has invited you to collaborate on the project <strong>${data.projectName}</strong>.</p>
            <p>Click the button below to accept the invitation and start collaborating:</p>
            <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${data.inviteUrl}</p>
            <div class="footer">
              <p>This invitation will expire in 7 days.</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send invite email:', error);
      // Don't throw - invite is still created in DB
    }
  }
}
