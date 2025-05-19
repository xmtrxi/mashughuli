export default defineEventHandler(async (_event) => {
  console.log(`[${_event.node.req.method}]  ${_event.node.req.url}`);
});
