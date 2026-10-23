import bcrypt from "bcrypt";

const generateHashPassword = async function (
    password: string
): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 12);

    return hashedPassword;
};

export { generateHashPassword };

