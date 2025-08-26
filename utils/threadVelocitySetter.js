export async function setBatchSize() {
  let threads = parseInt(process.env.UV_THREADPOOL_SIZE) || 4;

  let maxBatchSize = 100;
  let actualBatchSize = Math.min(threads * 10, maxBatchSize);
  return actualBatchSize;
}
