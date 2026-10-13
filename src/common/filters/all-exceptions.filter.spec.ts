import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ method: 'POST', url: '/api/v1/students' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('maps a foreign-key violation (P2003) to 400, not 500', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      {
        code: 'P2003',
        clientVersion: '6.0.0',
        meta: { field_name: 'admission_class_id' },
      },
    );

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Referenced admission_class_id does not exist',
      }),
    );
  });

  it('maps a unique-constraint violation (P2002) to 409', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '6.0.0',
        meta: { target: ['scholar_number'] },
      },
    );

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('passes through a thrown HttpException with its own status', () => {
    filter.catch(new BadRequestException('Validation failed'), host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Validation failed' }),
    );
  });

  it('never leaks internal details for an unknown error', () => {
    filter.catch(new Error('db connection string leaked here'), host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = jsonMock.mock.calls[0][0] as { message: string };
    expect(body.message).toBe('Internal server error');
    expect(body.message).not.toContain('leaked');
  });
});
