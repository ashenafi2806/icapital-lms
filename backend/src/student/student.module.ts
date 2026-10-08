import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StudentResolver } from './student.resolver.js';
import { StudentService } from './student.service.js';

@Module({
  imports: [AuthModule],
  providers: [StudentResolver, StudentService],
})
export class StudentModule {}
