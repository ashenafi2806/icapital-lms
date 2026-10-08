import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StudentType } from './dto/student.type.js';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<StudentType[]> {
    return this.prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
