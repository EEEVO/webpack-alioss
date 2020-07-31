type ITaskFn<T> = () => Promise<T>;
interface IQueueItem<T> {
  fn: ITaskFn<T>;
  reject: (error: any) => void;
  resolve: (res: T) => void;
}

export class PromisePool<T = any> {
  private limit = 5;
  private count = 0;
  private queue: IQueueItem<T>[] = [];
  private array: ITaskFn<T>[] = [];
  constructor(array: ITaskFn<T>[], limit: number) {
    this.array = array;
    this.limit = limit;
    this.count = 0;
    this.queue = [];
  }

  enqueue(fn: ITaskFn<T>) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
    });
  }

  async run(fn: ITaskFn<T>) {
    this.count++;
    const res = await fn();
    this.count--;
    this.dequeue();
    return res;
  }

  dequeue() {
    if (this.count < this.limit) {
      const firstItem = this.queue.shift();
      if (firstItem) {
        const { fn, resolve, reject } = firstItem;
        this.run(fn).then(resolve).catch(reject);
      }
    }
  }

  async build(fn: ITaskFn<T>) {
    if (this.count < this.limit) {
      return this.run(fn);
    } else {
      return this.enqueue(fn);
    }
  }

  start() {
    return Promise.all(this.array.map((fn) => this.build(fn)));
  }
}
