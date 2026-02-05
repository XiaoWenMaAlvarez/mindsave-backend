import { AppRoutes } from './presentation/routes.js';
import { Server } from './presentation/server.js';
import { envs } from './config/init.js';


(async()=> {
  main();
})();


async function main() {
  
  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });


  server.start();

}
