import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ExamResolver } from './exam.resolver.js';
import { ExamService } from './exam.service.js';

@Module({
  imports: [AuthModule],
  providers: [ExamResolver, ExamService],
})
export class ExamModule {}
