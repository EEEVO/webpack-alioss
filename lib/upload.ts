import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { from, of } from 'rxjs';
import AliOss from 'ali-oss';
import { mergeMap, expand, takeWhile } from 'rxjs/operators';
import { UploadInfoItem } from './interface';

const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

async function putToOss(targetPath: string, file: string, oss: AliOss) {
  console.log(`开始上传  ${file}`);
  const filename = path.basename(file);
  const ossName = `${targetPath}/${filename}`;
  await oss.put(ossName, file);
  return '';
}

export function uploadFiles(oss: AliOss, UploadInfoList: UploadInfoItem[]) {
  return new Promise((resolve, reject) => {
    from(UploadInfoList)
      .pipe(
        mergeMap(({ filePath, targetPath, test }) => {
          return of(filePath).pipe(
            expand((currentPath) =>
              of(currentPath).pipe(
                takeWhile((data) => !!data),
                mergeMap(() => {
                  return from(readdirAsync(currentPath)).pipe(
                    mergeMap((paths) => from(paths)),
                    mergeMap((pathsItem) => {
                      const finalPath = path.join(currentPath, pathsItem);
                      return from(statAsync(finalPath)).pipe(
                        mergeMap((stat) => {
                          if (stat.isDirectory()) {
                            return of(finalPath);
                          }
                          if (test.test(finalPath)) {
                            return from(putToOss(targetPath, finalPath, oss));
                          }
                          return of('');
                        }, 10)
                      );
                    })
                  );
                })
              )
            )
          );
        })
      )
      .subscribe(
        (data) => {
          // console.log(data);
        },
        (err) => {
          reject(err);
          console.log('err', err);
        },
        () => {
          console.log('上传完成');
          resolve();
        }
      );
  });
}
