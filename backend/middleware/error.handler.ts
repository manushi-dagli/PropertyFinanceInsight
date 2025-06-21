import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/response.handler";
import logger from "../config/logger";
import { constants } from "http2";
import { messages } from "../utils/messages";

export const asyncErrorHandler = (execution: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => 
(req: Request, res: Response, next: NextFunction) => {
    execution(req, res, next).catch((error) => {
        if (error instanceof ApiError) {
            next(error);
        } else {
            logger.error("An unexpected error occurred:", error);
            next(new ApiError(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, messages.SOMETHING_WENT_WRONG));
        }
    });
};