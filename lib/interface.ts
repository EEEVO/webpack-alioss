import fs from 'fs';
export interface AliyunOssConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
}

export interface UploadInfoItem {
  filePath: string;
  targetPath: string;
  test: RegExp;
}

export interface WebpackAliyunOssPluginOptions {
  aliyunOssConfig: AliyunOssConfig;
  uploadInfoList: UploadInfoItem[];
}

export interface StatAsyncValue {
  stat: fs.Stats;
  currentPath: string;
}
