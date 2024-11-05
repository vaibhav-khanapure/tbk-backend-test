import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import Settings from "../../database/tables/settingsTable";
import tboTokenGeneration from "../../utils/tboTokenGeneration";

const tokenGenerate = async(req: Request, res: Response, next: NextFunction)=>{
 
    try {
        await tboTokenGeneration(); // Call your token generation function
        console.log("Token Generated Successfully");
        return res.status(200).json("Token Generated Successfully"); 
       } catch (error) {
         next(error);
        console.error('Error in token generation:', error.message);
       }
 
};

export default tokenGenerate;