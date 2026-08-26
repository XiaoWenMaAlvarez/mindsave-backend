import type { JsonObject } from 'swagger-ui-express';

export const swaggerDocument: JsonObject = {
  openapi: "3.0.3",
  info: {
    title: "MindSave Backend API",
    version: "1.0.0",
    description: "API de salud mental construida con Express, TypeScript estricto, Prisma y PostgreSQL. Incluye módulos de autenticación, test breve de estado de ánimo, registro diario y chat con IA (Gemini).",
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
          name: { type: "string", example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", minLength: 6, example: "Password123!" }
        }
      },
      UserLoginDto: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          password: { type: "string", example: "Password123!" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", example: "USER_ROL" },
          token: { type: "string" }
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
      TestBreveDto: {
        type: "object",
        required: ["year", "month", "day", "animo"],
        properties: {
          year: { type: "integer", example: 2026 },
          month: { type: "integer", minimum: 1, maximum: 12, example: 8 },
          day: { type: "integer", minimum: 1, maximum: 31, example: 18 },
          animo: { type: "integer", minimum: 1, maximum: 5, example: 4 }
        }
      },
      RegistroEstadoAnimoDto: {
        type: "object",
        required: ["animo", "emociones", "pensamiento"],
        properties: {
          id: { type: "string", format: "uuid" },
          animo: { type: "integer", minimum: 1, maximum: 5, example: 3 },
          emociones: {
            type: "array",
            items: { type: "string" },
            example: ["ansiedad", "esperanza"]
          },
          pensamiento: { type: "string", example: "Reflexión del día..." },
          situacion: { type: "string", example: "Jornada laboral intensa" }
        }
      },
      ChatCreateDto: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Conversación sobre manejo del estrés" }
        }
      }
    }
  },
  tags: [
    { name: "Health", description: "Estado y verificación del servidor" },
    { name: "Auth", description: "Autenticación de usuarios públicos" },
    { name: "Admin Auth", description: "Autenticación de administradores y profesionales" },
    { name: "Admin Users", description: "Gestión administrativa de usuarios" },
    { name: "Test Breve Estado de Ánimo", description: "Test diario rápido de estado de ánimo" },
    { name: "Registro Estado de Ánimo", description: "Bitácora completa y detallada de estado de ánimo" },
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
                        gemini: { type: "string", example: "ready" },
                        cloudinary: { type: "string", example: "ready" },
                        mailer: { type: "string", example: "ready" }
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
                        gemini: { type: "string", example: "ready" },
                        cloudinary: { type: "string", example: "ready" },
                        mailer: { type: "string", example: "ready" }
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
          "200": { description: "Página HTML de confirmación" }
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
          "200": { description: "Página HTML con el formulario" }
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
    "/admin/auth/register": {
      post: {
        tags: ["Admin Auth"],
        summary: "Registrar profesional/administrador",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegisterDto" }
            }
          }
        },
        responses: {
          "201": { description: "Administrador registrado" },
          "400": { description: "Error en datos enviados" }
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
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
        ],
        responses: {
          "200": { description: "Lista de usuarios" },
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
          "200": { description: "Detalle del usuario" },
          "400": { description: "ID inválido o usuario no encontrado" }
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
              schema: { $ref: "#/components/schemas/UserRegisterDto" }
            }
          }
        },
        responses: {
          "200": { description: "Usuario actualizado" }
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
          "200": { description: "Usuario eliminado" }
        }
      }
    },
    "/admin/user/restore/{idUsuario}": {
      put: {
        tags: ["Admin Users"],
        summary: "Restaurar usuario eliminado",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idUsuario", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Usuario restaurado exitosamente" }
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
          "201": { description: "Test guardado" },
          "400": { description: "Validación incorrecta" }
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
          "200": { description: "Test actualizado" },
          "404": { description: "Test no encontrado o no pertenece al usuario autenticado" }
        }
      }
    },
    "/api/test-breve-estado-de-animo/{year}": {
      get: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Obtener registros de tests breves por año",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer", example: 2026 } }
        ],
        responses: {
          "200": { description: "Historial anual de tests breves" }
        }
      }
    },
    "/api/test-breve-estado-de-animo/{year}/{month}/{day}": {
      get: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Obtener test breve de una fecha específica",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer" } },
          { name: "month", in: "path", required: true, schema: { type: "integer" } },
          { name: "day", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          "200": { description: "Registro del día" }
        }
      },
      delete: {
        tags: ["Test Breve Estado de Ánimo"],
        summary: "Eliminar test breve de una fecha específica",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer" } },
          { name: "month", in: "path", required: true, schema: { type: "integer" } },
          { name: "day", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          "200": { description: "Test eliminado" }
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
          "201": { description: "Registro creado" }
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
              schema: { $ref: "#/components/schemas/RegistroEstadoAnimoDto" }
            }
          }
        },
        responses: {
          "200": { description: "Registro modificado" },
          "404": { description: "Registro no encontrado o no pertenece al usuario autenticado" }
        }
      }
    },
    "/api/registro-estado-de-animo/completos": {
      get: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Obtener registros completos paginados",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
        ],
        responses: {
          "200": { description: "Lista de registros completos" }
        }
      }
    },
    "/api/registro-estado-de-animo/pendientes": {
      get: {
        tags: ["Registro Estado de Ánimo"],
        summary: "Obtener registros pendientes paginados",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
        ],
        responses: {
          "200": { description: "Lista de registros pendientes" }
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
          "200": { description: "Detalle del registro" }
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
          "200": { description: "Registro eliminado" }
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
          "201": { description: "Chat creado", content: { "application/json": { schema: { type: "object", properties: { result: { type: "string", format: "uuid" } } } } } },
          "400": { description: "Título duplicado o usuario inexistente" }
        }
      }
    },
    "/api/chat-ia/chats": {
      get: {
        tags: ["Chat IA"],
        summary: "Obtener la lista de chats del usuario",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de conversaciones" }
        }
      }
    },
    "/api/chat-ia/messages/{idChat}": {
      get: {
        tags: ["Chat IA"],
        summary: "Obtener los mensajes de un chat",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "idChat", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          "200": { description: "Historial de mensajes" }
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
          "200": { description: "Chat eliminado" }
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
                  prompt: { type: "string", example: "Analiza esta imagen y cómo me siento" },
                  files: {
                    type: "array",
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
          "400": { description: "Límite excedido o archivo no permitido" }
        }
      }
    }
  }
};
