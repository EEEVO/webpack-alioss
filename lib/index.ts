import { Compiler } from 'webpack';
import AliOss from 'ali-oss';
import { WebpackAliyunOssPluginOptions, AliyunOssConfig } from './interface';
import { OSS_CONFIG_KEY } from './constant';
import { uploadFiles } from './upload';

export class WebpackAliyunOssPlugin {
  private options = {} as WebpackAliyunOssPluginOptions;
  constructor(options: WebpackAliyunOssPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tapAsync(
      'webpack-aliyun-oss-plugin',
      async (stats, callback) => {
        const { aliyunOssConfig, uploadInfoList } = this.options;

        if (!uploadInfoList.length) {
          return callback(
            `missing upload data, please check the UploadInfoList`
          );
        }

        for (const key of OSS_CONFIG_KEY) {
          if (!aliyunOssConfig[key as keyof AliyunOssConfig]) {
            return callback(`missing ${key}`);
          }
        }

        const oss = new AliOss(aliyunOssConfig);
        try {
          await uploadFiles(oss, uploadInfoList);
        } catch (error) {
          return callback(error);
        }
        return callback();
      }
    );
  }
}
