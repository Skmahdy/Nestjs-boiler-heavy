import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: ['query', 'error', 'warn'],
            errorFormat: 'pretty',
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.enableSoftDelete();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Helper method for transactions
    async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
        return this.$transaction(fn);
    }

    // Soft delete helper
    enableSoftDelete() {
        this.$use(async (params, next) => {
            // Handle soft delete
            if (params.action === 'delete') {
                params.action = 'update';
                params.args.data = { deletedAt: new Date() };
            }
            if (params.action === 'deleteMany') {
                params.action = 'updateMany';
                params.args.data = { deletedAt: new Date() };
            }

            // Filter out soft-deleted records in queries
            if (params.action === 'findUnique' || params.action === 'findFirst') {
                params.action = 'findFirst';
                params.args.where = {
                    ...(params.args.where || {}),
                    deletedAt: null,
                };
            }

            if (params.action === 'findMany') {
                if (params.args.where) {
                    if ((params.args.where as any).deletedAt === undefined) {
                        (params.args.where as any).deletedAt = null;
                    }
                } else {
                    params.args.where = { deletedAt: null };
                }
            }

            if (params.action === 'count') {
                if (params.args.where) {
                    if ((params.args.where as any).deletedAt === undefined) {
                        (params.args.where as any).deletedAt = null;
                    }
                } else {
                    params.args.where = { deletedAt: null };
                }
            }

            return next(params);
        });
    }
}
