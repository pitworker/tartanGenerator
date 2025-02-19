// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.ts` file does the single async import, so
// that no one else needs to worry about it again.
import("./main").catch((err: any) => {
  console.error("Error importing `main.ts`:", err);
});
