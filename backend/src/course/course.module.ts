import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CourseResolver } from './course.resolver.js';
import { CourseService } from './course.service.js';

@Module({
  imports: [AuthModule],
  providers: [CourseResolver, CourseService],
})
export class CourseModule {}
