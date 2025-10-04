import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { IsString } from 'class-validator';

export class AuthEnv {
  @IsString()
  JWT_SECRET: string;
}

export const authOptions = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
}));

export const getJWTConfig = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule],
  useFactory: async (config: ConfigService): Promise<JwtModuleOptions> => {
    return {
      secret: config.get<string>('auth.jwtSecret'),
      signOptions: { algorithm: 'HS256' },
    };
  },
});
