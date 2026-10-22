import multer from "multer";
import fs from "fs";
import path from "path";

const tempDir = path.join(process.cwd(),"temp");

if(!fs.existsSync(tempDir)){
	fs.mkdirSync(tempDir,{recursive:true});
}

const storage = multer.diskStorage({
	destination:(
		req : Express.Request,
		file : Express.Multer.File,
		cb : (error : Error | null, desination:string) => void) => {
		cb(null,tempDir);
	},
	filname : (
		req : Express.Request,
		file:Express.Multer.File,
		cb:(error : Error | null , filename:string) => void)=>{
		cb(null,file.originalname);
	},
});

export const upload = multer({storage});
