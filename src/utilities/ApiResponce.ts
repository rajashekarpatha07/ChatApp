class ApiResponse<T> {
  statuscode: number;
  message: string;
  data: T;
  status: boolean;

  constructor(statuscode: number, data: T, message: string = "Success") {
    this.statuscode = statuscode;
    this.message = message;
    this.data = data;
    this.status = statuscode < 400;
  }
}

export { ApiResponse };
