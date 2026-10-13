import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  info: {
    database: { status: 'up' | 'down' };
  };
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    const databaseUp = await this.isDatabaseHealthy();

    return {
      status: databaseUp ? 'ok' : 'error',
      info: {
        database: { status: databaseUp ? 'up' : 'down' },
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async isDatabaseHealthy(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
