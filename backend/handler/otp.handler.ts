import { randomInt } from "crypto";

const generateOtp = function (): string {
    return randomInt(1000, 10000).toString();
};
export {
	generateOtp
};
