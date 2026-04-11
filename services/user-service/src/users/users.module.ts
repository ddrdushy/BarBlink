import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
