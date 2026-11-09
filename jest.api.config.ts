import type {Config} from 'jest';

// Pruebas de API contra un servidor en ejecución (API_BASE_URL, por defecto http://localhost:3000).
const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  roots: ["<rootDir>/tests/api"],
  testMatch: ["**/*.api.test.ts"],
  clearMocks: true,
  collectCoverage: false,
  testTimeout: 90000,
  maxWorkers: 1,
};

export default config;
