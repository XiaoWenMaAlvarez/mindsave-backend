import express, { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface Options {
  port: number;
  routes: Router;
}


export class Server {

  public readonly app = express();
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes } = options;
    this.port = port;
    this.routes = routes;
  }

  async start() {
    this.app.use( express.json() );
    
    this.app.use( express.urlencoded({ extended: true }) ); // Para el formulario de recuperar contraseña

    this.app.use( this.routes );
    
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${ this.port }`);
    });

  }
}
