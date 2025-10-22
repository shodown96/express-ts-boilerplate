import server, { port } from "./server";
import { getLocalIp } from "./utilities/ip";

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ip]: ${getLocalIp()}`)
  }
});
