import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as md5 from 'md5';
import { AuthGuard } from '../auth/auth.guard';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  private readonly secretKey = process.env.SECRET_KEY;

  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthGuard)
  @Get()
  private findAll() {
    return this.userService.find();
  }

  @UseGuards(AuthGuard)
  @Post()
  private async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    if (createUserDto.name && createUserDto.email && createUserDto.password) {
      // Предоставлены имя и email (+ опционально enabled)
      const name: string = createUserDto.name;
      const email: string = createUserDto.email;
      const password: string = createUserDto.password;
      let enabled: boolean = true;
      if (typeof createUserDto.enabled === 'boolean') { enabled = createUserDto.enabled; }

      const newUser: User = {
        id: null,
        name,
        email,
        password,
        enabled,
      };

      try {
        return await this.userService.create(newUser);
      } catch (err) {
        if (err.status === 409) { throw new HttpException(err, HttpStatus.CONFLICT); }
        throw err;
      }

    } else {
      const err = {
        error: true,
        status: 422,
        message: 'Пожалуйста, укажите имя, email и пароль нового пользователя.',
      };
      throw new HttpException(err, HttpStatus.UNPROCESSABLE_ENTITY);
    }

  }

  @Post('/login')
  private async  login(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    if (createUserDto.email && createUserDto.password) {
      const email = createUserDto.email;
      const password = md5(createUserDto.password);
      const foundUser = await this.userService.findByEmail(email);

      if (foundUser && foundUser.password === password) {
        const token = jwt.sign({ userId: foundUser.id }, this.secretKey, { expiresIn: '4h' });
        const newData = { id: foundUser.id, token };
        await this.userService.update(newData);

        return {
          status: 200,
          message: 'Успешный вход в аккаунт',
          token,
        };

      } else {
        const err = {
          error: true,
          status: 401,
          message: 'Неправильные email или пароль. Вот вам тестовый аккаунт: email: joh@ny.boy; password: a12345678.',
        };
        throw new HttpException(err, HttpStatus.UNAUTHORIZED);
      }

    } else {
      const err = {
        error: true,
        status: 422,
        message: 'Пожалуйста, укажите email и пароль. Вот вам тестовый аккаунт: email: joh@ny.boy password: a12345678',
      };
      throw new HttpException(err, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  @UseGuards(AuthGuard)
  @Put('/:userId')
  private async update(@Body(ValidationPipe) updateUserDto: CreateUserDto, @Param('userId', ParseIntPipe) userId: number) {
    const id: number = Number(userId);
    const name: string = updateUserDto.name;
    const email: string = updateUserDto.email;
    const password: string = updateUserDto.password;
    let enabled: boolean;
    if (typeof updateUserDto.enabled === 'boolean') { enabled = updateUserDto.enabled; }

    if (!name && !email && !enabled && !password) {
      const err = {
        error: true,
        status: 422,
        message: 'Не было предоставлено данных для внесения изменений в json-файл. Укажите имя/email/password/enabled пользователя в запросе.',
      };
      throw new HttpException(err, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const user: User = {
      id,
      name,
      email,
      password,
      enabled,
    };

    try {
      return await this.userService.update(user);
    } catch (err) {
      if (err.status === 409) { throw new HttpException(err, HttpStatus.CONFLICT); }
      if (err.status === 404) { throw new HttpException(err, HttpStatus.NOT_FOUND); }
      throw err;
    }

  }

  @UseGuards(AuthGuard)
  @Delete('/:userId')
  private async delete(@Param('userId', ParseIntPipe) userId: number) {
    const id: number = Number(userId);

    try {
      return await this.userService.delete(id);
    } catch (err) {
      if (err.status === 404) { throw new HttpException(err, HttpStatus.NOT_FOUND); }
      throw err;
    }
  }

}
