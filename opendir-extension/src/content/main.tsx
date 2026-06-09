import { mountOpenDir } from './mount';

interface ExecuteOptions {
  perf: number;
}

export function onExecute(options: ExecuteOptions): Promise<void> {
  return mountOpenDir(options);
}

export default { onExecute };
