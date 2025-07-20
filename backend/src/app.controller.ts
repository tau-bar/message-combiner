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

  @Post('exchange-token')
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
      return res.status(200).json({ access_token, user_id });
    } catch (error) {
      return res
        .status(400)
        .json({ error: error.response?.data || error.message });
    }
  }
}
