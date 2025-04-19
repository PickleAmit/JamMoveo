import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    try {
      console.log(req.query);
      // Get username from query parameter (temporary solution)
      const username = req.query.username as string;

      if (!username) {
        throw new UnauthorizedException('No username provided');
      }

      // Find the user by username
      const user = await this.usersService.findByUsername(username);

      const { ...result } = user;
      return result;
    } catch (error: unknown) {
      throw new UnauthorizedException(error);
    }
  }

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('role') role: string = 'user',
    @Body('instrument') instrument?: string,
  ) {
    const user = await this.usersService.register(
      username,
      password,
      role,
      instrument,
    );

    // Create a simple mock token
    const mockToken = Buffer.from(
      `${user.id}:${user.username}:${Date.now()}`,
    ).toString('base64');

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      token: mockToken,
    };
  }

  @Post('admin/register')
  async registerAdmin(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('adminSecret') adminSecret: string,
  ) {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new ForbiddenException('Invalid admin secret');
    }

    const user = await this.usersService.register(username, password, 'admin');

    // Create a simple mock token
    const mockToken = Buffer.from(
      `${user.id}:${user.username}:${Date.now()}`,
    ).toString('base64');

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      token: mockToken, // Add token to response
    };
  }
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    // In a real app, you would return a JWT here
    const user = await this.usersService.validateUser(username, password);
    // Create a simple mock token - not secure, but works for dev
    const mockToken = Buffer.from(
      `${user.id}:${user.username}:${Date.now()}`,
    ).toString('base64');

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      token: mockToken,
    };
  }

  @Get('all')
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}
