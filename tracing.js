const { NodeTracerProvider } = require('@opentelemetry/node')
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api')
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const { JaegerHttpTracePropagator } = require('@opentelemetry/propagator-jaeger')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { ExpressInstrumentation } = require('./instrumentations/express')

const traceProvider = new NodeTracerProvider({})
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)

traceProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
traceProvider.addSpanProcessor(
  new SimpleSpanProcessor(
    new JaegerExporter({
      serviceName: 'nextjs-blog',
      endpoint: 'http://127.0.0.1:14268/api/traces',
      tags: [
        {
          key: 'tag-item',
          value: 'product',
        },
      ],
    }),
  ),
)
traceProvider.register({})

// Enable the instrumentation for the project
const httpInstrumentation = new HttpInstrumentation()
httpInstrumentation.enable()

const expressInstrumentation = new ExpressInstrumentation()
expressInstrumentation.enable()

//
registerInstrumentations({
  instrumentations: [
    {
      plugins: {
        mongodb: { enabled: false, path: '@opentelemetry/plugin-mongodb' },
        grpc: { enabled: false, path: '@opentelemetry/plugin-grpc' },
        '@grpc/grpc-js': { enabled: false, path: '@opentelemetry/plugin-grpc-js' },
        http: { enabled: false, path: '@opentelemetry/plugin-http' },
        https: { enabled: false, path: '@opentelemetry/plugin-https' },
        mysql: { enabled: false, path: '@opentelemetry/plugin-mysql' },
        pg: { enabled: false, path: '@opentelemetry/plugin-pg' },
        redis: { enabled: false, path: '@opentelemetry/plugin-redis' },
        ioredis: { enabled: false, path: '@opentelemetry/plugin-ioredis' },
        'pg-pool': { enabled: false, path: '@opentelemetry/plugin-pg-pool' },
        express: { enabled: false, path: '@opentelemetry/plugin-express' },
        '@hapi/hapi': { enabled: false, path: '@opentelemetry/hapi-instrumentation' },
        koa: { enabled: false, path: '@opentelemetry/koa-instrumentation' },
        dns: { enabled: false, path: '@opentelemetry/plugin-dns' },
      },
    },
  ],
  tracerProvider: traceProvider,
})

module.exports = { traceProvider }
