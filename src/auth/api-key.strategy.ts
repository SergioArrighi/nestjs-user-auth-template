import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import Strategy from 'passport-headerapikey';

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super(
      { header: 'X-API-Key', prefix: '' },
      true,
      async (apiKey: string, done: (error: Error, data: any) => {}) => {
        return this.validate(apiKey, done);
      },
    );
  }

  public validate = (apiKey: string, done: (error: Error, data: any) => {}) => {
    if (this.configService.get('APP_API_KEY') === apiKey) {
      done(null, { roles: ['robot'] });
      return;
    }
    done(new UnauthorizedException(), null);
  };
}
