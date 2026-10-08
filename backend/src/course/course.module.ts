import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CourseService } from './course.service.js';

@Module({
  imports: [AuthModule],
  providers: [CourseService],
})
export class CourseModule {}
