import 'dotenv/config';
import env from "env-var";

const JWT_SEED = env.get("JWT_SEED").required().asString();
const JWT_EMAIL_VERIFICATION_SEED = env.get("JWT_EMAIL_VERIFICATION_SEED").required().asString();
const JWT_PASSWORD_RESET_SEED = env.get("JWT_PASSWORD_RESET_SEED").required().asString();

if (new Set([JWT_SEED, JWT_EMAIL_VERIFICATION_SEED, JWT_PASSWORD_RESET_SEED]).size !== 3) {
  throw new Error("JWT_SEED, JWT_EMAIL_VERIFICATION_SEED and JWT_PASSWORD_RESET_SEED must be different");
}

export const envs = {
  PORT: env.get('PORT').required().asPortNumber(),
  NODE_ENV: env.get('NODE_ENV').required().asString(),

  POSTGRES_URL: env.get("POSTGRES_URL").required().asString(),
  POSTGRES_USER: env.get("POSTGRES_USER").required().asString(),
  POSTGRES_DB: env.get("POSTGRES_DB").required().asString(),
  POSTGRES_PASSWORD: env.get("POSTGRES_PASSWORD").required().asString(),

  JWT_SEED,
  JWT_EMAIL_VERIFICATION_SEED,
  JWT_PASSWORD_RESET_SEED,

  MAILER_SERVICE: env.get("MAILER_SERVICE").required().asString(),
  MAILER_EMAIL: env.get("MAILER_EMAIL").required().asEmailString(),
  MAILER_SECRET_KEY: env.get("MAILER_SECRET_KEY").required().asString(),

  WEBSERVICE_URL: env.get('WEBSERVICE_URL').required().asString(),

  GEMINI_API_KEY: env.get('GEMINI_API_KEY').required().asString(),

  CLOUDINARY_API_KEY: env.get('CLOUDINARY_API_KEY').required().asString(),
  CLOUDINARY_API_SECRET: env.get('CLOUDINARY_API_SECRET').required().asString(),
  CLOUDINARY_CLOUD_NAME: env.get('CLOUDINARY_CLOUD_NAME').required().asString(),

}
