export class ErrorItem {
  field: string;
  message: string;
}

export class ErrorResponse {
  errorsMessages: ErrorItem[];
}
