import express from 'express';
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import { user } from "../db/schema/index.js";
import { db } from "../db/index.js";

const router = express.Router();

router.get('/', async (req , res) => {
    try {
        const { search, role, page, limit } = req.query;

        const pageNum = typeof page === 'string' ? parseInt(page, 10) : NaN;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : NaN;
        const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
        const limitPerPage = Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 10;

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if(search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    sql`${user.role}::text ilike ${`%${search}%`}`
                )
            );
        }

        //search query with SQL protection
        // if(role) {
        //     const rolePattern = `%${String(role).replace(/[%_]/g, '\\$&')}%`;
        //     filterConditions.push(ilike(user.role, rolePattern));
        // }

        if (role) {
            // Cast the enum to text here as well
            filterConditions.push(
                sql`${user.role}::text ilike ${`%${role}%`}`
            );
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(user)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const usersList = await db
            .select({...getTableColumns(user) })
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount /limitPerPage),
            }
        });
    } catch (e) {
        console.error(`Error while getting user from server: ${e}`);
        res.status(500).json({error: 'Something went wrong'});
    }
})

export default router;