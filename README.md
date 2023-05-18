# cf-debugger
Debugger for connected function

### Node version: >= 14

## Steps to set up:
1. In source folder, run `yarn link` to link this package to global node-modules
2. In connected-function folder (mainFn), run `yarn link cf-debugger` to pull the package to local node-modules
3. Create dev.ts in ./src folder to run debugger
    ```
    // in mainFn/src/dev.ts
    
    import cfDebugger from 'cf-debugger'

    cfDebugger('3000', './')
    ```
4. In mainFn folder, start debbugger server by running `npx ts-node /src/dev.ts`
5. Open [Chrome Inspect](chrome://inspect/#devices) to add connection to localhost:9999
6. Using Postman to call server
7. Watching inspect in Chrome Inscpect tool.


Note: 
- Using `debugger` to set breakpoint in function.
- Adding `sked-api-server` - https://api.skedulo.com to Request Header to use Skedulo API.
- Enabling souremap in webpack and tsconfig to see readable source in Chrome Inspect.
