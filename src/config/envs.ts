import 'dotenv/config';
import env from "env-var";


export const envs = {
  PORT: env.get('PORT').required().asPortNumber(),
  NODE_ENV: env.get('NODE_ENV').required().asString(),

  POSTGRES_URL: env.get("POSTGRES_URL").required().asString(),
  POSTGRES_USER: env.get("POSTGRES_USER").required().asString(),
  POSTGRES_DB: env.get("POSTGRES_DB").required().asString(),
  POSTGRES_PASSWORD: env.get("POSTGRES_PASSWORD").required().asString(),
  JWT_SEED: env.get("JWT_SEED").required().asString(),
  MAILER_SERVICE: env.get("MAILER_SERVICE").required().asString(),
  MAILER_EMAIL: env.get("MAILER_EMAIL").required().asEmailString(),
  MAILER_SECRET_KEY: env.get("MAILER_SECRET_KEY").required().asString(),
  WEBSERVICE_URL: env.get('WEBSERVICE_URL').required().asString()
}

