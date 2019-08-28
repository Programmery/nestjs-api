import { IsAlpha, IsEmail, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsAlpha({
    message: 'Предоставлено некорректное имя пользователя. Имя может содержать только буквы.',
  })
  public name: string;
  @IsOptional()
  @IsEmail(
    {}, {
      message: 'Предоставлен email некорректного формата.',
    })
  public email?: string;
  @IsOptional()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Пароль должен быть не менее 8 символов, а также содержать одну букву и одну цифру.',
  })
  @MaxLength(50, {
    message: 'Максимальная длина пароля - 50 символов',
  })
  public password: string;
  public enabled: boolean;
  public token?: boolean;
}
