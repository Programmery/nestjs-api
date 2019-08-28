import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  public transform(value: string, metadata: ArgumentMetadata): number {
    const val = Number(value);
    if (isNaN(val)) {
      const error = {
        statusCode: 400,
        error: 'Bad Request',
        message: [
          {
            target: {},
            value,
            property: 'userId',
            children: [],
            constraints: {
              minLength: 'ID пользователя может быть только числом.',
            },
          },
        ],
      };
      throw new BadRequestException(error);
    }
    return val;
  }
}
