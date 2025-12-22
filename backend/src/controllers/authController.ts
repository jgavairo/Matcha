import { Request, Response } from 'express';

export class AuthController {

    async register(req: Request, res: Response) {
        res.status(200).json({ message: 'Register request received' });
    }


}
