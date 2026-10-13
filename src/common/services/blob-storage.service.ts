import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put } from '@vercel/blob';
import type { AppConfig } from '../../config/configuration';

@Injectable()
export class BlobStorageService {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  /**
   * Uploads a file to Vercel Blob and returns its public URL. Requires
   * BLOB_READ_WRITE_TOKEN to be set — throws a clear error otherwise
   * rather than failing the whole app at boot, since most of the API
   * works fine without file uploads configured.
   */
  async upload(pathPrefix: string, file: Express.Multer.File): Promise<string> {
    const token = this.configService.get('blob.readWriteToken', {
      infer: true,
    });

    if (!token) {
      throw new InternalServerErrorException(
        'File uploads are not configured (missing BLOB_READ_WRITE_TOKEN)',
      );
    }

    const blob = await put(
      `${pathPrefix}/${Date.now()}-${file.originalname}`,
      file.buffer,
      {
        access: 'public',
        token,
        contentType: file.mimetype,
      },
    );

    return blob.url;
  }
}
