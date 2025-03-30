import bcryptjs from "bcryptjs";

const saltRounds = 10;

export const hashPassword = async (password) => {
    const salt = await bcryptjs.genSalt(saltRounds);
    return await bcryptjs.hash(password, salt);
}

export const comparePassword = async (plain, hashed) => 
    await bcryptjs.compare(plain, hashed);
