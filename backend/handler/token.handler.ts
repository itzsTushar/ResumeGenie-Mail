import jwt from "jsonwebtoken"
import { ApiError } from "../utilis/apierror.ts"
import "dotenv/config";


const generateRefreshToken = async function(id:string,username:string,email:string):Promise<string>{
	try{
		return jwt.sign({
			_id : id,
			username : username,
			email:email},
			process.env.REFRESH_TOKEN_SECRET!,
			{ expiresIn:process.env.REFRESH_TOKEN_EXPIRY} as jwt.SignOptions
			);
		}
	catch(err){
		throw new ApiError(500,"Failed to generate refresh token");
		}
	}
const generateAccessToken = async function(id:string,username:string,email:string):Promise<string>{
	try{
		return jwt.sign({
    			_id : id,
   			username:username,
    			email:email},
			process.env.ACCESS_TOKEN_SECRET!,
			{expiresIn:process.env.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
			);
	}catch(err){
		throw new ApiError(500,"Failed to generate access token");
		}
	}

const decodeToken = async function(token:string,secret:string=process.env.ACCESS_TOKEN_SECRET!){
	try{
		if(!token){
			throw new ApiError(401,"Unauthorised request");
			}
		return jwt.verify(token,secret);
		}catch(err){
			if(err instanceof ApiError) {
				throw err;
			}
			throw new ApiError(401,"Invalid or expired access token");
		}
	}





export{
    generateRefreshToken,
    generateAccessToken,
    decodeToken
};
