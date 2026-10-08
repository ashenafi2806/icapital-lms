import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StudentType } from './dto/student.type.js';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<StudentType[]> {
    const totalCourseCount = await this.prisma.course.count();
    const students = await this.prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { createdAt: 'desc' },
      include: {
        progress: {
          include: { course: true },
        },
        attempts: true,
      },
    });

    return students.map((student) => {
      const progress = student.progress.map((item) => {
        const attempts = student.attempts.filter(
          (attempt) => attempt.progressId === item.id,
        );
        const bestScore = attempts.reduce<number | null>(
          (best, attempt) => (best === null || attempt.score > best ? attempt.score : best),
          null,
        );
        return {
          courseTitle: item.course.title,
          status: item.status,
          isPassed: item.isPassed,
          bestScore,
          attempts: attempts.length,
        };
      });
      return {
        id: student.id,
        email: student.email,
        role: student.role,
        createdAt: student.createdAt,
        progress,
        passedCourseCount: progress.filter((item) => item.isPassed).length,
        totalCourseCount,
      };
    });
  }
}
