import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';

@Controller('api/file')
export class FileController {
  private static readonly destination = './uploads';
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: FileController.destination,
      filename: (req, file, cb) => {
        const fileName = FileController.encodeName(file.originalname);
        return cb(null, fileName);
      },
    }),
  }))
  private upload(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('Пожалуйста, укажите файл для загрузки');
    }
    return {
      status: 202,
      message: 'Файл загружен.',
      file,
    };
  }

  @Get('/:reqName')
  private download(@Param('reqName') reqName: string, @Res() res: Response) {
    const fileName = FileController.encodeName(reqName);
    const file = join(FileController.destination, fileName);

    if (fs.existsSync(file)) {
      return res.download(file, reqName);
    } else {
      res.status(404);
      res.json({
        error: true,
        status: 404,
        message: `Файл c именем '${reqName.toString()}' не был найден на сервере.`,
      });
      return res.end();
    }
  }

  private static encodeName(name): string {
    const stringName = String(name);
    const buffName = Buffer.from(stringName);
    return buffName.toString('base64');
  }
}
