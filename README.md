
Execute the following steps:

1. npm install
2. npm run build
3. NODE_ENV=development node server.js
4: Open in http://127.0.0.1:3000 (edited)

An exception is thrown when you follow the above instructions:

```
❯ NODE_ENV=development node server.js                                                                     (main) [~/next-reproduce/nextjs-blog]
error - ./node_modules/next/dist/client/dev/amp-dev.js
TypeError: _tracer.tracer.withSpan is not a function
> Ready on http://localhost:3000
event - build page: /next/dist/pages/_error
wait  - compiling...
error - ./node_modules/next/dist/client/next-dev.js
TypeError: _tracer.tracer.withSpan is not a function
Error: Cannot find module '/Users/weyertdeboer/next-reproduce/nextjs-blog/.next/server/pages-manifest.json'
Require stack:
- /Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/require.js
- /Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/load-components.js
- /Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/api-utils.js
- /Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js
- /Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/server/next.js
- /Users/weyertdeboer/next-reproduce/nextjs-blog/server.js
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:1080:15)
    at Function.mod._resolveFilename (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/build/webpack/require-hook.js:4:1715)
    at Function.Module._load (internal/modules/cjs/loader.js:923:27)
    at Module.require (internal/modules/cjs/loader.js:1140:19)
    at require (internal/modules/cjs/helpers.js:75:18)
    at getPagePath (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/require.js:1:657)
    at requirePage (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/require.js:1:1062)
    at loadComponents (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/load-components.js:1:807)
    at DevServer.findPageComponents (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js:74:296)
    at DevServer.renderErrorToHTML (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js:134:120)
    at DevServer.renderErrorToHTML (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/server/next-dev-server.js:34:974)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at async DevServer.render (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js:72:236)
    at async Object.fn (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js:56:580)
    at async Router.execute (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/router.js:23:67)
    at async DevServer.run (/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js:66:1042) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/require.js',
    '/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/load-components.js',
    '/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/api-utils.js',
    '/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/next-server/server/next-server.js',
    '/Users/weyertdeboer/next-reproduce/nextjs-blog/node_modules/next/dist/server/next.js',
    '/Users/weyertdeboer/next-reproduce/nextjs-blog/server.js'
  ]
}
```
