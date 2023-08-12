type ImmediatePromise = Promise<'pending' | 'resolved' | 'failed'>;

type Defer<T> = {
  promise: Promise<T>;
  checkSettleState: () => boolean;
  resolve: (value: T) => void;
  reject: () => void;
};

function createDeferP<T = void>(): Defer<T> {
  let resolve!: (value: T) => void;
  let reject!: () => void;
  let hasSettled = false;

  function onSettle<Fn extends (...value: any[]) => any>(fn: Fn) {
    return (...args: Parameters<Fn>) => {
      if (!hasSettled && (hasSettled = true)) {
        fn(...args);
      }
    };
  }

  const promise = new Promise<T>((_res, _rej) => {
    resolve = onSettle(_res);
    reject = onSettle(_rej);
  });

  return { promise, resolve, checkSettleState: () => hasSettled, reject };
}

function getPromiseImmediateStatus(task: Promise<unknown>): ImmediatePromise {
  const { promise, resolve } = createDeferP<Awaited<ImmediatePromise>>();

  task.then(
    () => resolve('resolved'),
    () => resolve('failed')
  );

  queueMicrotask(() => resolve('pending'));

  return promise;
}

export { getPromiseImmediateStatus, Defer };
