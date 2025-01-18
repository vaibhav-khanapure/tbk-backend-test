import { NextFunction, Request, Response } from "express";
import { fixflyTokenPath } from "../../config/paths";
import { readFile } from "fs/promises";
import axios from "axios";

class tboMainAPITunnelController {
    static async ssr(req: Request, res: Response, next: NextFunction) {
        try {
            const token = await readFile(fixflyTokenPath, "utf-8");
            req.body.TokenId = token;
            req.body.EndUserIp = process.env.END_USER_IP;
            const URL = `${process.env.TBO_FLIGHT_SEARCH_API_URL}/SSR`;

            const { data } = await axios({
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                url: URL,
                method: 'POST',
                data: req.body
            });

            return res.status(200).json(data);
        } catch (error) {
            return res.status(200).json(error);
        }
    };

    static async searchFlights(req: Request, res: Response, next: NextFunction) {
        try {
            const token = await readFile(fixflyTokenPath, "utf-8");
            req.body.TokenId = token;
            req.body.EndUserIp = process.env.END_USER_IP;
            const URL = `${process.env.TBO_FLIGHT_SEARCH_API_URL}/Search`;

            const { data } = await axios({
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                url: URL,
                method: 'POST',
                data: req.body
            });

            return res.status(200).json(data);
        } catch (error) {
            return res.status(200).json(error);
        }
    };

    static async FareQuote(req: Request, res: Response, next: NextFunction) {
        try {
            const token = await readFile(fixflyTokenPath, "utf-8");
            req.body.TokenId = token;
            req.body.EndUserIp = process.env.END_USER_IP;
            const URL = `${process.env.TBO_FLIGHT_SEARCH_API_URL}/FareQuote`;

            const { data } = await axios({
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                url: URL,
                method: 'POST',
                data: req.body
            });

            return res.status(200).json(data);
        } catch (error) {
            return res.status(200).json(error);
        }
    };

    static async FareRule(req: Request, res: Response, next: NextFunction) {
        try {
            const token = await readFile(fixflyTokenPath, "utf-8");
            req.body.TokenId = token;
            req.body.EndUserIp = process.env.END_USER_IP;
            const URL = `${process.env.TBO_FLIGHT_SEARCH_API_URL}/FareRule`;

            const { data } = await axios({
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                url: URL,
                method: 'POST',
                data: req.body
            });

            return res.status(200).json(data);
        } catch (error) {
            return res.status(200).json(error);
        }
    };
};

export default tboMainAPITunnelController;