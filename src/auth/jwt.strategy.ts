import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 👈 هنا ناخد التوكين من الهيدر
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECERT_JWT_ACCESS') || 'default_secret',
    });
  }

  async validate(payload: any) {
    // ترجع البيانات اللي هتتحط في req.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
