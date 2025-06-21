import { Response } from "express";

export type ControllerResponse = ApiResponse | Response;

export class ApiResponse {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {}

  protected prepare(res: Response): Response {
    return res.status(this.status).json({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }

  public send(res: Response): Response {
    return this.prepare(res);
  }
}

export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
  }

  public handle(err: ApiError, res: Response): ControllerResponse {
    const message = err.message;
    return new ApiResponse(err.status, message).send(res);
  }
}
