class ApiError<T> extends Error {
  statuscode: number;
  data: T | null;
  success: boolean;
  errors: T[];

  constructor(
    statuscode: number,
    message: string = "something went wrong",
    errors: T[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statuscode = statuscode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
