import express from 'express';
import {db} from '../db';
import { departments, subjects } from '../db/schema';;
import {and, count, eq, getTableColumns, ilike, or} from 'drizzle-orm';


const router=express.Router();
router.get('/',async(req,res)=>{
    try {
        const data=await db.select().from(departments).orderBy(departments.name);
        res.status(200).json({
            data: data,
            pagination: {
                total: data.length,
                page: 1,
                limit: data.length,
            }
        });
        
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({error:'Internal server error'});
    }



});

export default router;

