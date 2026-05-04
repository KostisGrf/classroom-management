import { and, eq, getTableColumns, ilike, or, sql, desc } from 'drizzle-orm';
import express from 'express';
import { user } from '../db/schema/index.js';
import { db } from '../db/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`)
                )
            );
        }

        const allowedRoles = ['student', 'teacher', 'admin'] as const;
        if (typeof role === 'string' && allowedRoles.includes(role as any)) {
            filterConditions.push(eq(user.role, role as typeof allowedRoles[number]));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.select({ count: sql`count(*)` })
            .from(user)
            .where(whereClause);

        const totalCount = Number(countResult[0]?.count || 0);

        const usersResult = await db.select({ ...getTableColumns(user) })
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersResult,
            pagination: {
                total: totalCount,
                page: currentPage,
                limit: limitPerPage,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
