import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public getHello(): string {
    return 'Функционал API находится по адресам "/api/file" и "/api/user". Но спасибо, что заглянули...';
  }
}
