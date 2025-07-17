import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // 🔥 الاتصال الفعلي عند بدء تشغيل الموديل
    console.log('✅ Prisma connected to DB');
  }

  async onModuleDestroy() {
    await this.$disconnect(); // 🔒 إغلاق الاتصال عند إنهاء التطبيق
  }
}
