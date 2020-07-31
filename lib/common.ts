import _glob from "glob";

export const glob = (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    _glob(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};
