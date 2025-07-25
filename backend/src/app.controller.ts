import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// In-memory store for Instagram tokens (user_id -> access_token)
const instagramTokenStore = new Map<string, string>();

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('webhooks')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const VERIFY_TOKEN = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Forbidden');
    }
  }

  @Get('instagram_auth')
  redirectToInstagram(@Res() res: Response) {
    const clientId = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
    const redirectUri = this.configService.get<string>(
      'INSTAGRAM_REDIRECT_URI',
    );

    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=instagram_business_basic,instagram_business_manage_messages&response_type=code`;

    return res.redirect(authUrl);
  }

  @Post('ig_token_exchange')
  async exchangeToken(@Body('code') code: string, @Res() res: Response) {
    const client_id = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
    const client_secret = this.configService.get<string>(
      'INSTAGRAM_CLIENT_SECRET',
    );
    const redirect_uri = this.configService.get<string>(
      'INSTAGRAM_REDIRECT_URI',
    );
    if (!code) {
      throw new HttpException('Missing code', HttpStatus.BAD_REQUEST);
    }
    try {
      const params = new URLSearchParams();
      params.append('client_id', client_id);
      params.append('client_secret', client_secret);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', redirect_uri);
      params.append('code', code);
      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        params,
      );
      const { access_token, user_id } = response.data;
      // Store the access_token in memory by user_id
      instagramTokenStore.set(user_id, access_token);
      return res.status(200).json({ access_token, user_id });
    } catch (error) {
      return res
        .status(400)
        .json({ error: error.response?.data || error.message });
    }
  }

  // Optional: Endpoint to retrieve a stored token by user_id (for testing/demo)
  @Get('ig_token/:user_id')
  getInstagramToken(@Query('user_id') user_id: string, @Res() res: Response) {
    const token = instagramTokenStore.get(user_id);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    return res.status(200).json({ access_token: token });
  }
}
