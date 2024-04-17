import { ErrorResponse } from '../errors/errors';
import { HttpStatus } from '@nestjs/common';

export enum RESULT_CODES {
  'Success' = 0,
  'Success_no_content' = 1,
  'Forbidden' = 2,
  'Not_found' = 3,
  'Bad_request' = 4,
}

const RESULT_CODES_TO_HTTP: Record<RESULT_CODES, HttpStatus> = {
  [RESULT_CODES.Success]: HttpStatus.OK,
  [RESULT_CODES.Success_no_content]: HttpStatus.NO_CONTENT,
  [RESULT_CODES.Forbidden]: HttpStatus.FORBIDDEN,
  [RESULT_CODES.Not_found]: HttpStatus.NOT_FOUND,
  [RESULT_CODES.Bad_request]: HttpStatus.BAD_REQUEST,
};

export type Result<T> = {
  resultCode: RESULT_CODES;
  data?: T;
  errorMessage?: string | ErrorResponse;
};

type ResultToHttpResponse<T> = {
  body?: T;
  statusCode: HttpStatus;
};

export const ResultService = {
  createResult<T>(
    resultCode: RESULT_CODES,
    errorMessage?: string | ErrorResponse,
    data?: T,
  ): Result<T> {
    return { data, errorMessage, resultCode };
  },

  createError(fieldName: string, errorText: string): ErrorResponse {
    return { errorsMessages: [{ field: fieldName, message: errorText }] };
  },

  mapResultToHttpResponse(result: Result<any>): ResultToHttpResponse<any> {
    return {
      statusCode: RESULT_CODES_TO_HTTP[result.resultCode],
      body: result.data ? result.data : result.errorMessage,
    };
  },
};
