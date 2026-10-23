import bcrypt from "bcrypt";

const generateHashPassword = async function (password: string): Promise<string> {
    return await bcrypt.hash(password, 12);

};
const validateHashPassword = async function (enterPassword : string , checkPassword :string):Promise<boolean>{
	return await bcrypt.compare(enterPassword,checkPassword);
};
	
	
export { generateHashPassword,validateHashPassword };

