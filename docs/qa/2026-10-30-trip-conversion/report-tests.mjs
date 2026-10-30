export default async function* (events) {
  for await (const {type, data} of events) {
    if (type === 'test:fail') {
      const error = data.details?.error?.cause ?? data.details?.error;
      yield `FAIL ${data.name}\n${data.file}:${data.line}\n${error?.stack?.split('\n').filter(line => /at .*\.mjs:/.test(line)).slice(0, 2).join('\n') ?? ''}\nExpected: ${String(error?.expected ?? '')}\n`;
    }
    if (type === 'test:summary') yield `${JSON.stringify(data)}\n`;
  }
}
