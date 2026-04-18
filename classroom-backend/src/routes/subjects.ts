import { and, eq, getTableColumns, ilike, or, sql, desc } from 'drizzle-orm';
import express, { json } from 'express';
import { departments, subjects } from '../db/schema';
import { db } from '../db';
import { get } from 'node:http';

const router=express.Router();

//Get all subjects with optional search, pagination and filtering
router.get('/',async(req,res)=>{
    try {
        const {search,deparment,page=1,limit=10}=req.query;

        const currentPage=Math.max(1,+page);
        const limitPerPage=Math.max(1,+limit);
        
        const offset=(currentPage-1)*limitPerPage;

        const filterConditions=[];

        if(search){
            filterConditions.push(or(
                ilike(subjects.name,`%${search}%`),
                ilike(subjects.code,`%${search}%`)
            ))
        }

        if(deparment){
            filterConditions.push(ilike(departments.name,`%${deparment}%`));
        }

        const whereClause=filterConditions.length > 0 ? and(...filterConditions):undefined;

        const countResult=await db.select({count:sql<number>`count(*)`})
            .from(subjects)
            .leftJoin(departments,eq(subjects.departmentId,departments.id))
            .where(whereClause);

        const totalCount=countResult[0]?.count || 0;

        const subjectsResult=await 
        db.select({...getTableColumns(subjects),department:{...getTableColumns(departments)}})
            .from(subjects)
            .leftJoin(departments,eq(subjects.departmentId,departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.created_at))
            .limit(limitPerPage)
            .offset(offset);
            

        res.status(200).json({
            data:subjectsResult,
            pagination:{
                total:totalCount,
                page:currentPage,
                limit:limitPerPage,
                totalPages:Math.ceil(totalCount/limitPerPage)
            }
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({message:'Internal server error'});
    }
});

export default router;