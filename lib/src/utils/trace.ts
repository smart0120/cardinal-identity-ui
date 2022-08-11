import * as SentryBrowser from '@sentry/browser'
import type * as Sentry from '@sentry/types'

export type Trace = ReturnType<Sentry.Hub['startTransaction']>

export const withTrace = async <T>(
  fn: () => Promise<T>,
  trace?: Trace,
  ctx?: Pick<
    Sentry.SpanContext,
    Exclude<
      keyof Sentry.SpanContext,
      'spanId' | 'sampled' | 'traceId' | 'parentSpanId'
    >
  >
) => {
  const s = ctx ? trace?.startChild(ctx) : undefined
  const r = await fn()
  ctx ? s?.finish() : trace?.finish()
  return r
}

export const tracer = (
  ctx: Sentry.TransactionContext
): Sentry.Transaction | undefined => {
  return SentryBrowser.startTransaction(ctx)
}
