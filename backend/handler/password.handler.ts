import bcrypt from "bcrypt";

const generateHashPassword = async function (
    password: string
): Promise<string> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
};

export { generateHashPassword };

