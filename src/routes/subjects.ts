import express from 'express';
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get('/', async (req , res) => {
    try {
        const { search, department, page, limit } = req.query;

        const pageNum = typeof page === 'string' ? parseInt(page, 10) : NaN;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : NaN;
        const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
        const limitPerPage = Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 10;

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if(search) {
            filterConditions.push(
                or(
                        ilike(subjects.name, `%${search}%`),
                        ilike(subjects.code, `%${search}%`),
                    )
                );
        }

        //search query with SQL protection
        if(department) {
            const depPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departments.name, depPattern));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db.select({
            ...getTableColumns(subjects),
            departments:  {...getTableColumns(departments)}
        }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount /limitPerPage),
            }
        });
    } catch (e) {
        console.error(`Error while getting subjects from server: ${e}`);
        res.status(500).json({error: 'Something went wrong'});
    }
})

export default router;