import { Test } from '@nestjs/testing';

import { Readable } from 'stream';

import { ImagesService } from './images.service';
import { LocalImagesProvider } from './local.images.provider.';

describe('ImagesService', () => {
  let imagesService: ImagesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ImagesService,
        LocalImagesProvider,
        {
          provide: ImagesService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue('complete'),
          },
        },
      ],
    }).compile();

    imagesService = module.get(ImagesService);
  });

  describe('Uploading Image', () => {
    it('calls v2.uploader.upload_stream and returns the result', async () => {
      let file: Express.Multer.File = {
        filename: '',
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 1,
        stream: new Readable(),
        destination: '',
        path: '',
        buffer: new Buffer(''),
      };
      const result = await imagesService.uploadImage(file);
      expect(result).toBeDefined();
    });
  });
});
