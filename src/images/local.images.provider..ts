import { v2 } from 'cloudinary';
import { CLOUDINARY } from './constants';

export const LocalImagesProvider = {
  provide: CLOUDINARY,
  useFactory: (): any => {
    return v2.config({
      cloud_name: 'test',
      api_key: 'test',
      api_secret: 'test',
    });
  },
};
