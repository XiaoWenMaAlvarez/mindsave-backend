import 'dotenv/config';
import env from "env-var";


export const envs = {
  PORT: env.get('PORT').required().asPortNumber(),
  NODE_ENV: env.get('NODE_ENV').required().asString(),

  POSTGRES_URL: env.get("POSTGRES_URL").required().asString(),
  POSTGRES_USER: env.get("POSTGRES_USER").required().asString(),
  POSTGRES_DB: env.get("POSTGRES_DB").required().asString(),
  POSTGRES_PASSWORD: env.get("POSTGRES_PASSWORD").required().asString(),

}
