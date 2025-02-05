import "dotenv/config";
import {join} from "path";

export const fixflyTokenPath = join(process.cwd(), "/src/config/fixflyToken.txt");

export const officialLogoPath = `${process.env.SERVER_URL}/api/v1/images/tbklogo.png`;