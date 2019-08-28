import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as md5 from 'md5';
import * as path from 'path';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly filePath = path.join(__dirname, '..', 'data', 'user-data.json');

  public async find(): Promise<User[]> {
    const data = fs.readFileSync(this.filePath, 'utf-8');
    const users = data.toString();
    if (users !== '') {
      return JSON.parse(users);
    } else {
      // Если файл пустой, то заполнить его пустым массивом и вернуть его
      const emptyJson = JSON.stringify([]);
      fs.writeFileSync(this.filePath, emptyJson);
      return this.find();
    }
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const existingUsers: User[] = await this.find();
    return existingUsers.find(user => user.email === email);
  }

  public async findById(id: number): Promise<User | undefined> {
    const existingUsers: User[] = await this.find();
    return existingUsers.find(user => user.id === id);
  }

  public async create(newUser: User) {
    // Проверить существует ли email нового user в файле json
    const foundUser = await this.findByEmail(newUser.email);
    if (foundUser) {
      throw {
        error: true,
        status: 409,
        message: 'Такой email уже зарегистрирован.',
      };
    }

    // Указанный email не зарегистрирован - можно добавлять пользователя
    const existingUsers: User[] = await this.find();
    let resultData: string;

    newUser.password = md5(newUser.password);
    // Для создания нового ID - проверить есть ли в файле пользователи
    if (existingUsers.length > 0) {
      // Авто-инкремент ID нового пользователя
      newUser.id = existingUsers[existingUsers.length - 1].id + 1;
      existingUsers.push(newUser);
      resultData = JSON.stringify(existingUsers, null, "\t");

    } else {
      // Добавленных ранее пользователей нет => добавить первого пользователя с id 1
      newUser.id = 1;
      resultData = JSON.stringify([newUser], null, "\t");
    }
    // Записать данные в json
    fs.writeFileSync(this.filePath, resultData);
    return this.find();

  }

  public async update(newData: { id: number, name?: string, email?: string, password?: string, enabled?: boolean, token?: string }) {
    const existingUsers: User[] = await this.find();
    let userExists: boolean = false;
    for (const user of existingUsers) {
      // Если пользователь пытается изменить email на уже зарегистрированный email ДРУГОГО пользователя => ошибка (допускается менять прошлый email пользователя на такой же)
      if (newData.email) {
        if (user.email === newData.email && user.id !== newData.id) {
          throw {
            error: true,
            status: 409,
            message: 'Такой email уже зарегистрирован.',
          };
        }
      }
      // Внести изменения по заданным в put req данным
      if (user.id === newData.id) {
        userExists = true;
        user.name = newData.name ? newData.name : user.name;
        user.email = newData.email ? newData.email : user.email;
        user.password = newData.password ? md5(newData.password) : user.password;
        user.enabled = newData.enabled !== undefined ? newData.enabled : user.enabled;
        user.token = newData.token !== undefined ? newData.token : user.token;
      }
    }
    // Если нет пользователя с предоставленным ID => reject
    if (!userExists) {
      throw {
        error: true,
        status: 404,
        message: `Пользователя с ID ${newData.id} не существует.`,
      };

    } else {
      // Если пользователь найден => обновить данные в файле json и вернуть json
      const resultData = JSON.stringify(existingUsers, null, "\t");
      fs.writeFileSync(this.filePath, resultData);
      return this.find();
    }
  }

  public async delete(id: number) {
    const foundUser: false | User = await this.findById(id);

    if (foundUser) {
      const existingUsers: User[] = await this.find() as User[];
      const filteredUsers = existingUsers.filter(user => foundUser.id !== user.id);
      const resultData = JSON.stringify(filteredUsers, null, "\t");

      await fs.writeFileSync(this.filePath, resultData);
      return this.find();
    } else {
      throw {
        error: true,
        status: 404,
        message: `Пользователя с ID ${id} не существует.`,
      };
    }
  }
}
