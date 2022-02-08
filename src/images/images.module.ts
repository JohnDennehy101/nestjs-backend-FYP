import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesProvider } from './images.provider';

@Module({
  providers: [ImagesService, ImagesProvider],
  exports: [ImagesService, ImagesProvider]
})
export class ImagesModule {}
