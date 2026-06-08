import { mountOpenDir } from './mount';

interface ExecuteOptions {
  perf: number;
}

export function onExecute(options: ExecuteOptions): void {
  mountOpenDir(options);
}

export default { onExecute };
