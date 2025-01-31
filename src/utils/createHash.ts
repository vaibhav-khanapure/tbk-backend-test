import crypto from "crypto";

const createSHA256Hash = (inputString: string): string => {
 const hash = crypto.createHash('sha256');
 hash.update(inputString);
 return hash.digest('hex');
};

export default createSHA256Hash;