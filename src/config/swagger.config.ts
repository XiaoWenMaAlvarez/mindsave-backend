import type { JsonObject } from 'swagger-ui-express';

export const swaggerDocument: JsonObject = {
  openapi: "3.0.3",
  info: {
    title: "MindSave Backend API",
    version: "1.0.0",
    description: "API de salud mental construida con Express, TypeScript estricto, Prisma y PostgreSQL. Incluye módulos de autenticación, test breve de estado de ánimo, registro cognitivo y chat con IA (Gemini).",
    contact: {
      name: "MindSave Support",
      url: "https://github.com/XiaoWenMaAlvarez/mindsave-backend"
    }
  },
  servers: [
    {
      url: "/",
      description: "Servidor actual"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Ingresa el token JWT en el formato: Bearer <token>"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            example: "Mensaje de error descriptivo"
          }
        }
      },
      UserRegisterDto: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", minLength: 6, example: "Password123!" }
        }
      },
      AdminUserCreateDto: {
        type: "object",
        required: ["name", "email", "password", "role", "emailVerified"],
        properties: {
          name: { type: "string", minLength: 2, example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", minLength: 6, example: "Password123!" },
          role: { type: "string", enum: ["USER_ROL", "PROFESIONAL_ROL"], example: "USER_ROL" },
          emailVerified: { type: "boolean", example: false }
        }
      },
      AdminUserUpdateDto: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", minLength: 6, example: "Password123!" },
          role: { type: "string", enum: ["USER_ROL", "PROFESIONAL_ROL"], example: "USER_ROL" },
          emailVerified: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true }
        }
      },
      UserLoginDto: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", minLength: 6, example: "Password123!" }
        }
      },
      ResendEmailVerificationDto: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "juan.perez@example.com" }
        }
      },
      AuthResponse: {
        type: "object",
        required: ["id", "email", "name", "role", "token"],
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", example: "USER_ROL" },
          token: { type: "string" }
        }
      },
      AdminUserResponse: {
        type: "object",
        required: ["id", "email", "name", "password", "emailVerified", "role", "isActive"],
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          password: { type: "string", readOnly: true, example: "" },
          emailVerified: { type: "boolean" },
          role: { type: "string", enum: ["USER_ROL", "PROFESIONAL_ROL"] },
          isActive: { type: "boolean" }
        }
      },
      AdminUsersPageResponse: {
        type: "object",
        required: ["results", "totalPages", "page", "limit"],
        properties: {
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/AdminUserResponse" }
          },
          totalPages: { type: "integer", minimum: 1 },
          page: { type: "integer", minimum: 1 },
          limit: { type: "integer", minimum: 1, maximum: 999 }
        }
      },
      StatusSuccessResponse: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["success"] }
        }
      },
      ResetPasswordRequestDto: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "juan.perez@example.com" }
        }
      },
      ResetPasswordSubmitDto: {
        type: "object",
        required: ["password"],
        properties: {
          password: { type: "string", minLength: 6, example: "NuevaClave123!" }
        }
      },
      TestBreveDepresionDto: {
        type: "object",
        required: ["tristeza", "desesperanza", "bajaAutoestima", "faltaDeValor", "perdidaDeSatisfaccion"],
        properties: {
          tristeza: { type: "integer", minimum: 0, maximum: 4, example: 1 },
          desesperanza: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          bajaAutoestima: { type: "integer", minimum: 0, maximum: 4, example: 2 },
          faltaDeValor: { type: "integer", minimum: 0, maximum: 4, example: 1 },
          perdidaDeSatisfaccion: { type: "integer", minimum: 0, maximum: 4, example: 0 }
        }
      },
      TestBreveImpulsoSuicidaDto: {
        type: "object",
        required: ["pensamientosSuicidas", "deseosDeMorir"],
        properties: {
          pensamientosSuicidas: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          deseosDeMorir: { type: "integer", minimum: 0, maximum: 4, example: 0 }
        }
      },
      TestBreveAnsiedadFisicaDto: {
        type: "object",
        required: [
          "palpitaciones", "sudoracion", "temblores", "dificultadRespirar",
          "ahogo", "dolorPecho", "nauseas", "mareos", "sensacionIrrealidad", "inestabilidadHormigueos"
        ],
        properties: {
          palpitaciones: { type: "integer", minimum: 0, maximum: 4, example: 1 },
          sudoracion: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          temblores: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          dificultadRespirar: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          ahogo: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          dolorPecho: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          nauseas: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          mareos: { type: "integer", minimum: 0, maximum: 4, example: 1 },
          sensacionIrrealidad: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          inestabilidadHormigueos: { type: "integer", minimum: 0, maximum: 4, example: 0 }
        }
      },
      TestBreveAnsiedadEmocionalDto: {
        type: "object",
        required: ["angustiado", "nervioso", "preocupado", "asustado", "tenso"],
        properties: {
          angustiado: { type: "integer", minimum: 0, maximum: 4, example: 2 },
          nervioso: { type: "integer", minimum: 0, maximum: 4, example: 1 },
          preocupado: { type: "integer", minimum: 0, maximum: 4, example: 2 },
          asustado: { type: "integer", minimum: 0, maximum: 4, example: 0 },
          tenso: { type: "integer", minimum: 0, maximum: 4, example: 1 }
        }
      },
      TestBreveDto: {
        type: "object",
        required: ["depresion", "impulsoSuicida", "ansiedadFisica", "ansiedadEmocional", "fecha", "notas"],
        properties: {
          id: { type: "string", format: "uuid" },
          depresion: { $ref: "#/components/schemas/TestBreveDepresionDto" },
          impulsoSuicida: { $ref: "#/components/schemas/TestBreveImpulsoSuicidaDto" },
          ansiedadFisica: { $ref: "#/components/schemas/TestBreveAnsiedadFisicaDto" },
          ansiedadEmocional: { $ref: "#/components/schemas/TestBreveAnsiedadEmocionalDto" },
          fecha: { type: "string", format: "date-time", example: "2026-08-26T00:00:00.000Z" },
          notas: { type: "string", nullable: true, maxLength: 500, example: "Día tranquilo con leve cansancio" }
        }
      },
      TestBreveResponse: {
        type: "object",
        required: ["id", "idUsuario", "depresion", "impulsoSuicida", "ansiedadFisica", "ansiedadEmocional", "fecha"],
        properties: {
          id: { type: "string", format: "uuid" },
          idUsuario: { type: "string", format: "uuid" },
          depresion: { $ref: "#/components/schemas/TestBreveDepresionDto" },
          impulsoSuicida: { $ref: "#/components/schemas/TestBreveImpulsoSuicidaDto" },
          ansiedadFisica: { $ref: "#/components/schemas/TestBreveAnsiedadFisicaDto" },
          ansiedadEmocional: { $ref: "#/components/schemas/TestBreveAnsiedadEmocionalDto" },
          fecha: { type: "string", format: "date-time" },
          notas: { type: "string", nullable: true, maxLength: 500 }
        }
      },
      NullableTestBreveResponse: {
        type: "object",
        nullable: true,
        allOf: [
          { $ref: "#/components/schemas/TestBreveResponse" }
        ]
      },
      EmocionesGrupo1Dto: {
        type: "object",
        required: ["triste", "melancolico", "deprimido", "decaido", "infeliz", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          triste: { type: "boolean", example: true },
          melancolico: { type: "boolean", example: false },
          deprimido: { type: "boolean", example: true },
          decaido: { type: "boolean", example: false },
          infeliz: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 70 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 30 }
        }
      },
      EmocionesGrupo2Dto: {
        type: "object",
        required: ["angustiado", "preocupado", "conPanico", "nervioso", "asustado", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          angustiado: { type: "boolean", example: false },
          preocupado: { type: "boolean", example: true },
          conPanico: { type: "boolean", example: false },
          nervioso: { type: "boolean", example: true },
          asustado: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 60 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 25 }
        }
      },
      EmocionesGrupo3Dto: {
        type: "object",
        required: ["culpable", "conRemordimiento", "malo", "avergonzado", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          culpable: { type: "boolean", example: false },
          conRemordimiento: { type: "boolean", example: false },
          malo: { type: "boolean", example: false },
          avergonzado: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 0 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: null }
        }
      },
      EmocionesGrupo4Dto: {
        type: "object",
        required: ["inferior", "sinValor", "inadecuado", "deficiente", "incompetente", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          inferior: { type: "boolean", example: false },
          sinValor: { type: "boolean", example: false },
          inadecuado: { type: "boolean", example: true },
          deficiente: { type: "boolean", example: false },
          incompetente: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 45 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 20 }
        }
      },
      EmocionesGrupo5Dto: {
        type: "object",
        required: ["solitario", "noQuerido", "noDeseado", "rechazado", "solo", "abandonado", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          solitario: { type: "boolean", example: false },
          noQuerido: { type: "boolean", example: false },
          noDeseado: { type: "boolean", example: false },
          rechazado: { type: "boolean", example: false },
          solo: { type: "boolean", example: false },
          abandonado: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 0 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: null }
        }
      },
      EmocionesGrupo6Dto: {
        type: "object",
        required: ["turbado", "tonto", "humillado", "apurado", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          turbado: { type: "boolean", example: false },
          tonto: { type: "boolean", example: false },
          humillado: { type: "boolean", example: false },
          apurado: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 0 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: null }
        }
      },
      EmocionesGrupo7Dto: {
        type: "object",
        required: ["desesperanzado", "desanimado", "pesimista", "descorazonado", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          desesperanzado: { type: "boolean", example: false },
          desanimado: { type: "boolean", example: true },
          pesimista: { type: "boolean", example: false },
          descorazonado: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 50 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 15 }
        }
      },
      EmocionesGrupo8Dto: {
        type: "object",
        required: ["frustrado", "atascado", "chasqueado", "derrotado", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          frustrado: { type: "boolean", example: true },
          atascado: { type: "boolean", example: true },
          chasqueado: { type: "boolean", example: false },
          derrotado: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 65 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 20 }
        }
      },
      EmocionesGrupo9Dto: {
        type: "object",
        required: ["airado", "enfadado", "resentido", "molesto", "irritado", "trastornado", "furioso", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          airado: { type: "boolean", example: false },
          enfadado: { type: "boolean", example: false },
          resentido: { type: "boolean", example: false },
          molesto: { type: "boolean", example: true },
          irritado: { type: "boolean", example: false },
          trastornado: { type: "boolean", example: false },
          furioso: { type: "boolean", example: false },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 40 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 10 }
        }
      },
      EmocionesPersonalizadasDto: {
        type: "object",
        required: ["listaEmociones", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues"],
        properties: {
          listaEmociones: {
            type: "array",
            items: { type: "string" },
            example: ["abrumado", "impaciente"]
          },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 55 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 20 }
        }
      },
      PensamientoDto: {
        type: "object",
        required: [
          "pensamientoNegativo", "porcentajeCreenciaAntes", "porcentajeCreenciaDespues",
          "pensamientoPositivo", "porcentajeCreenciaPositivo", "distorsion"
        ],
        properties: {
          pensamientoNegativo: { type: "string", example: "Nunca voy a terminar este proyecto a tiempo" },
          porcentajeCreenciaAntes: { type: "integer", minimum: 0, maximum: 100, example: 85 },
          porcentajeCreenciaDespues: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 25 },
          pensamientoPositivo: { type: "string", nullable: true, example: "Si avanzo paso a paso y priorizo lo esencial, podré entregarlo" },
          porcentajeCreenciaPositivo: { type: "integer", minimum: 0, maximum: 100, nullable: true, example: 75 },
          distorsion: {
            type: "array",
            items: { type: "boolean" },
            minItems: 10,
            maxItems: 10,
            description: "10 distorsiones cognitivas: [todoONada, generalizacionExcesiva, filtroMental, descalificarLoPositivo, conclusionesApresuradas, magnificacion, razonamientoEmocional, declaracionesDebe, etiquetacion, personalizacion]",
            example: [false, true, false, false, true, false, false, false, false, false]
          }
        }
      },
      RegistroEstadoAnimoDto: {
        type: "object",
        required: [
          "fecha", "sucesoTrastornador",
          "grupoEmociones1", "grupoEmociones2", "grupoEmociones3",
          "grupoEmociones4", "grupoEmociones5", "grupoEmociones6",
          "grupoEmociones7", "grupoEmociones8", "grupoEmociones9",
          "grupoEmocionesPersonalizadas", "pensamientos"
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          fecha: { type: "string", format: "date-time", example: "2026-08-26T14:30:00.000Z" },
          sucesoTrastornador: { type: "string", example: "Problema inesperado durante la entrega del entregable" },
          grupoEmociones1: { $ref: "#/components/schemas/EmocionesGrupo1Dto" },
          grupoEmociones2: { $ref: "#/components/schemas/EmocionesGrupo2Dto" },
          grupoEmociones3: { $ref: "#/components/schemas/EmocionesGrupo3Dto" },
          grupoEmociones4: { $ref: "#/components/schemas/EmocionesGrupo4Dto" },
          grupoEmociones5: { $ref: "#/components/schemas/EmocionesGrupo5Dto" },
          grupoEmociones6: { $ref: "#/components/schemas/EmocionesGrupo6Dto" },
          grupoEmociones7: { $ref: "#/components/schemas/EmocionesGrupo7Dto" },
          grupoEmociones8: { $ref: "#/components/schemas/EmocionesGrupo8Dto" },
          grupoEmociones9: { $ref: "#/components/schemas/EmocionesGrupo9Dto" },
          grupoEmocionesPersonalizadas: { $ref: "#/components/schemas/EmocionesPersonalizadasDto" },
          pensamientos: {
            type: "array",
            items: { $ref: "#/components/schemas/PensamientoDto" }
          }
        }
      },
      RegistroEstadoAnimoEditDto: {
        allOf: [
          { $ref: "#/components/schemas/RegistroEstadoAnimoDto" },
          {
            type: "object",
            required: ["id"]
          }
        ]
      },
      RegistroEstadoAnimoResponse: {
        allOf: [
          { $ref: "#/components/schemas/RegistroEstadoAnimoDto" },
          {
            type: "object",
            required: ["id", "idUsuario"],
            properties: {
              idUsuario: { type: "string", format: "uuid" }
            }
          }
        ]
      },
      RegistroEstadoAnimoPageResponse: {
        type: "object",
        required: ["results", "page", "limit"],
        properties: {
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/RegistroEstadoAnimoResponse" }
          },
          page: {
            oneOf: [
              { type: "integer", minimum: 1 },
              { type: "string", pattern: "^[1-9][0-9]*$" }
            ]
          },
          limit: {
            oneOf: [
              { type: "integer", minimum: 1 },
              { type: "string", pattern: "^[1-9][0-9]*$" }
            ]
          }
        }
      },
      ChatCreateDto: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, example: "Conversación sobre manejo del estrés" }
        }
      },
      ChatResponse: {
        type: "object",
        required: ["id", "idUsuario", "title", "mensajes"],
        properties: {
          id: { type: "string", format: "uuid" },
          idUsuario: { type: "string", format: "uuid" },
          title: { type: "string", example: "Conversación sobre manejo del estrés" },
          mensajes: {
            type: "array",
            items: { $ref: "#/components/schemas/ChatMessageResponse" }
          }
        }
      },
      ChatAttachmentResponse: {
        type: "object",
        required: ["fileUri", "mimeType", "fileUrl"],
        properties: {
          fileUri: { type: "string", format: "uri" },
          mimeType: { type: "string", example: "image/png" },
          fileUrl: { type: "string", format: "uri" }
        }
      },
      ChatMessageResponse: {
        type: "object",
        required: ["id", "text", "createdAt", "role", "archivos"],
        properties: {
          id: { type: "string", format: "uuid" },
          text: { type: "string", example: "Hola, ¿cómo puedo ayudarte hoy?" },
          createdAt: { type: "string", format: "date-time" },
          role: { type: "string", enum: ["user", "model", "system"], example: "model" },
          archivos: {
            type: "array",
            items: { $ref: "#/components/schemas/ChatAttachmentResponse" }
          }
        }
      },
      ChatListResponse: {
        type: "object",
        required: ["results"],
        properties: {
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/ChatResponse" }
          }
        }
      },
      ChatDetailResponse: {
        type: "object",
        required: ["result"],
        properties: {
          result: {
            $ref: "#/components/schemas/ChatResponse"
          }
        }
      }
    }
  },
  tags: [
    { name: "Health", description: "Estado y verificación del servidor" },
    { name: "Auth", description: "Autenticación de usuarios públicos" },
    { name: "Admin Auth", description: "Autenticación de administradores y profesionales" },
    { name: "Admin Users", description: "Gestión administrativa de usuarios" },
    { name: "Test Breve Estado de Ánimo", description: "Test diario breve de depresión, ansiedad e impulso suicida" },
    { name: "Registro Estado de Ánimo", description: "Registro cognitivo detallado de emociones, pensamientos y distorsiones" },
    { name: "Chat IA", description: "Conversaciones interactivas y análisis multimodal con Gemini" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health Check del servidor y estado de servicios",
        responses: {
          "200": {
            description: "Servidor operativo y base de datos conectada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number", example: 120.45 },
                    services: {
                      type: "object",
                      properties: {
                        database: { type: "string", example: "connected" },
                        gemini: { type: "string", example: "connected" },
                        cloudinary: { type: "string", example: "connected" },
                        mailer: { type: "string", example: "connected" }
                      }
                    }
                  }
                }
              }
            }
          },
          "503": {
            description: "Fallo en la conexión con la base de datos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "error" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number", example: 120.45 },
                    services: {
                      type: "object",
                      properties: {
                        database: { type: "string", example: "disconnected" },
                        gemini: { type: "string", example: "disconnected" },
                        cloudinary: { type: "string", example: "disconnected" },
                        mailer: { type: "string", example: "disconnected" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar nuevo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegisterDto" }
            }
          }
        },
        responses: {
          "201": { description: "Usuario registrado con éxito" },
          "400": { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/auth/resend-validation-email": {
      post: {
        tags: ["Auth"],
        summary: "Reenviar correo de validación de cuenta",
        description: "Por privacidad, responde de la misma forma si el correo no existe, ya fue validado o no corresponde a una cuenta de usuario activa.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResendEmailVerificationDto" }
            }
          }
        },
        responses: {
          "200": {
            description: "Solicitud procesada; se envía un enlace nuevo si la cuenta está pendiente de validación",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message"],
                  properties: { message: { type: "string", enum: ["OK"] } }
                }
              }
            }
          },
          "400": { description: "Email inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "No fue posible generar el enlace o enviar el correo" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión de usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLoginDto" }
            }
          }
        },
        responses: {
          "200": { description: "Inicio de sesión exitoso", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "400": { description: "Credenciales inválidas" },
          "401": { description: "Email no verificado" }
        }
      }
    },
    "/api/auth/check-status": {
      get: {
        tags: ["Auth"],
        summary: "Renovar y validar token de usuario",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Sesión activa", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "401": { description: "Token no proporcionado o inválido" }
        }
      }
    },
    "/api/auth/validate-email/{token}": {
      get: {
        tags: ["Auth"],
        summary: "Validar correo electrónico mediante token",
        parameters: [
          { name: "token", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Página HTML de confirmación" },
          "400": { description: "Token inválido o expirado" }
        }
      }
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Solicitar correo para restablecer contraseña",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequestDto" }
            }
          }
        },
        responses: {
          "200": { description: "Correo enviado si el email existe", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "OK" } } } } } },
          "400": { description: "Email inválido" }
        }
      }
    },
    "/api/auth/reset-password/{token}": {
      get: {
        tags: ["Auth"],
        summary: "Formulario HTML para restablecer contraseña",
        parameters: [
          { name: "token", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Página HTML con el formulario" },
          "400": { description: "Token inválido o expirado" }
        }
      },
      post: {
        tags: ["Auth"],
        summary: "Establecer nueva contraseña",
        parameters: [
          { name: "token", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: { $ref: "#/components/schemas/ResetPasswordSubmitDto" }
            },
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordSubmitDto" }
            }
          }
        },
        responses: {
          "200": { description: "Contraseña actualizada exitosamente" },
          "400": { description: "Token o contraseña inválidos" }
        }
      }
    },
    "/admin/auth/login": {
      post: {
        tags: ["Admin Auth"],
        summary: "Iniciar sesión de administrador",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLoginDto" }
            }
          }
        },
        responses: {
          "200": { description: "Login exitoso", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "400": { description: "Credenciales inválidas" },
          "401": { description: "Credenciales o rol no autorizado" }
        }
      }
    },
    "/admin/auth/check-status": {
      get: {
        tags: ["Admin Auth"],
        summary: "Verificar token de administrador",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Sesión activa", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "401": { description: "Token no válido o rol incorrecto" }
        }
      }
    },
    "/admin/user": {
      get: {
        tags: ["Admin Users"],
        summary: "Listar usuarios con paginación",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 999, default: 10 } },
          { name: "query", in: "query", schema: { type: "string", maxLength: 100 }, description: "Busca por nombre o email" },
          { name: "emailVerify", in: "query", schema: { type: "string", enum: ["verify", "unverify", ""] } },
          { name: "rol", in: "query", schema: { type: "string", enum: ["USER_ROL", "PROFESIONAL_ROL", ""] } },
          { name: "state", in: "query", schema: { type: "string", enum: ["active", "inactive", ""] } }
        ],
        responses: {
          "200": { description: "Lista de usuarios", content: { "application/json": { schema: { $ref: "#/components/schemas/AdminUsersPageResponse" } } } },
          "400": { description: "Filtros o paginación inválidos" },
          "401": { description: "No autorizado" }
        }
      },
      post: {
        tags: ["Admin Users"],
        summary: "Crear nuevo usuario",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminUserCreateDto" }
            }
          }
        },
        responses: {
          "201": { description: "Usuario creado exitosamente", content: { "application/json": { schema: { $ref: "#/components/schemas/AdminUserResponse" } } } },
          "400": { description: "Error en datos enviados" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/admin/user/{idUsuario}": {
      get: {
        tags: ["Admin Users"],
        summary: "Obtener detalle de usuario por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idUsuario", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Detalle del usuario", content: { "application/json": { schema: { $ref: "#/components/schemas/AdminUserResponse" } } } },
          "400": { description: "ID inválido o usuario no encontrado" },
          "401": { description: "No autorizado" }
        }
      },
      put: {
        tags: ["Admin Users"],
        summary: "Actualizar datos de usuario",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idUsuario", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminUserUpdateDto" }
            }
          }
        },
        responses: {
          "200": { description: "Usuario actualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "Datos inválidos" },
          "401": { description: "No autorizado" }
        }
      },
      delete: {
        tags: ["Admin Users"],
        summary: "Eliminar lógicamente un usuario",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idUsuario", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Usuario eliminado", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "ID inválido" },
          "404": { description: "Usuario no encontrado" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/admin/user/restore-user/{idUsuario}": {
      put: {
        tags: ["Admin Users"],
        summary: "Restaurar usuario eliminado",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idUsuario", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Usuario restaurado exitosamente", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "ID inválido" },
          "404": { description: "Usuario no encontrado" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/test-breve-estado-de-animo": {
      post: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Registrar test breve de hoy",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TestBreveDto" }
            }
          }
        },
        responses: {
          "201": { description: "Test guardado exitosamente", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "Validación incorrecta" },
          "401": { description: "No autorizado" }
        }
      },
      put: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Editar test breve de hoy",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TestBreveDto" }
            }
          }
        },
        responses: {
          "200": { description: "Test actualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "Validación incorrecta" },
          "404": { description: "Test no encontrado o no pertenece al usuario autenticado" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/test-breve-estado-de-animo/by-year/{year}": {
      get: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Obtener registros de tests breves por año",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer", example: 2026 } }
        ],
        responses: {
          "200": {
            description: "Historial anual de tests breves",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TestBreveResponse" }
                }
              }
            }
          },
          "400": { description: "Año inválido" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/test-breve-estado-de-animo/by-date/{year}/{month}/{day}": {
      get: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Obtener test breve de una fecha específica",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer" } },
          { name: "month", in: "path", required: true, schema: { type: "integer", minimum: 1, maximum: 12 } },
          { name: "day", in: "path", required: true, schema: { type: "integer", minimum: 1, maximum: 31 } }
        ],
        responses: {
          "200": { description: "Test del día o null si no existe", content: { "application/json": { schema: { $ref: "#/components/schemas/NullableTestBreveResponse" } } } },
          "400": { description: "Fecha inválida" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/test-breve-estado-de-animo/{year}/{month}/{day}": {
      delete: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Eliminar test breve de una fecha específica",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer" } },
          { name: "month", in: "path", required: true, schema: { type: "integer", minimum: 1, maximum: 12 } },
          { name: "day", in: "path", required: true, schema: { type: "integer", minimum: 1, maximum: 31 } }
        ],
        responses: {
          "200": { description: "Test eliminado", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "Fecha inválida" },
          "404": { description: "Test breve no encontrado" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/registro-estado-de-animo": {
      post: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Crear nuevo registro de estado de ánimo",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistroEstadoAnimoDto" }
            }
          }
        },
        responses: {
          "201": {
            description: "Registro creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "id"],
                  properties: {
                    status: { type: "string", enum: ["success"] },
                    id: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          },
          "400": { description: "Validación incorrecta" },
          "401": { description: "No autorizado" }
        }
      },
      put: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Editar registro existente",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistroEstadoAnimoEditDto" }
            }
          }
        },
        responses: {
          "200": { description: "Registro modificado", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "Validación incorrecta" },
          "404": { description: "Registro no encontrado o no pertenece al usuario autenticado" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/registro-estado-de-animo/completos": {
      get: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Obtener registros completos paginados",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, default: 10 } }
        ],
        responses: {
          "200": { description: "Lista de registros completos", content: { "application/json": { schema: { $ref: "#/components/schemas/RegistroEstadoAnimoPageResponse" } } } },
          "400": { description: "Paginación inválida" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/registro-estado-de-animo/pendientes": {
      get: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Obtener registros pendientes paginados",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, default: 10 } }
        ],
        responses: {
          "200": { description: "Lista de registros pendientes", content: { "application/json": { schema: { $ref: "#/components/schemas/RegistroEstadoAnimoPageResponse" } } } },
          "400": { description: "Paginación inválida" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/registro-estado-de-animo/{idRegistro}": {
      get: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Obtener un registro por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idRegistro", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Detalle del registro", content: { "application/json": { schema: { $ref: "#/components/schemas/RegistroEstadoAnimoResponse" } } } },
          "400": { description: "ID inválido" },
          "404": { description: "Registro no encontrado" },
          "401": { description: "No autorizado" }
        }
      },
      delete: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Eliminar un registro por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idRegistro", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Registro eliminado", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusSuccessResponse" } } } },
          "400": { description: "ID inválido" },
          "404": { description: "Registro no encontrado" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/chat-ia/new-chat": {
      post: {
        tags: ["Chat IA"],
        summary: "Crear una nueva conversación",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatCreateDto" }
            }
          }
        },
        responses: {
          "201": { description: "Chat creado", content: { "application/json": { schema: { type: "object", required: ["result"], properties: { result: { type: "string", format: "uuid" } } } } } },
          "400": { description: "Título duplicado o usuario inexistente" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/chat-ia/get-chats-by-user": {
      get: {
        tags: ["Chat IA"],
        summary: "Obtener la lista de chats del usuario",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de conversaciones",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatListResponse" }
              }
            }
          },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/chat-ia/get-messages-from-chat/{idChat}": {
      get: {
        tags: ["Chat IA"],
        summary: "Obtener los mensajes de un chat",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idChat", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": {
            description: "Historial de mensajes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatDetailResponse" }
              }
            }
          },
          "400": { description: "ID de chat inválido, chat inexistente o ajeno" },
          "401": { description: "No autorizado" }
        }
      }
    },
    "/api/chat-ia/delete-chat/{idChat}": {
      delete: {
        tags: ["Chat IA"],
        summary: "Eliminar una conversación",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idChat", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": {
            description: "Chat eliminado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["result"],
                  properties: {
                    result: { type: "string", enum: ["success"] }
                  }
                }
              }
            }
          },
          "400": { description: "ID de chat inválido" },
          "404": { description: "Chat no encontrado" },
          "401": { description: "No autorizado" },
          "500": { description: "No fue posible eliminar todos los archivos remotos del chat" }
        }
      }
    },
    "/api/chat-ia/send-message-to-chat/{idChat}": {
      post: {
        tags: ["Chat IA"],
        summary: "Enviar mensaje con archivos adjuntos y recibir stream de Gemini",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idChat", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["prompt"],
                properties: {
                  prompt: { type: "string", minLength: 1, example: "Analiza esta imagen y cómo me siento" },
                  files: {
                    type: "array",
                    maxItems: 5,
                    items: { type: "string", format: "binary" },
                    description: "Máximo 5 archivos (imágenes o documentos, máx. 5MB cada uno)"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Stream de respuesta de Gemini en texto plano",
            content: {
              "text/plain": {
                schema: { type: "string" }
              }
            }
          },
          "400": { description: "Chat inexistente o ajeno, payload inválido, límite excedido o archivo no permitido" },
          "401": { description: "No autorizado" },
          "500": { description: "Falló la generación o la persistencia del turno" },
          "502": { description: "No fue posible subir todos los archivos adjuntos" }
        }
      }
    }
  }
};
