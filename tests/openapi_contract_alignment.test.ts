import { describe, expect, test } from "@jest/globals";
import { swaggerDocument } from "../src/config/swagger.config.js";
import { AdminUserRouter } from "../src/presentation/admin/user/routes.js";

interface OpenApiSchema {
  $ref?: string;
  type?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  maxItems?: number;
}

interface OpenApiParameter {
  name: string;
  in: string;
  schema?: OpenApiSchema;
}

interface OpenApiOperation {
  parameters?: OpenApiParameter[];
  requestBody?: {
    content: Record<string, { schema: OpenApiSchema }>;
  };
  responses: Record<string, {
    content?: Record<string, { schema: OpenApiSchema }>;
  }>;
}

interface OpenApiDocument {
  paths: Record<string, Partial<Record<HttpMethod, OpenApiOperation>>>;
  components: {
    schemas: Record<string, OpenApiSchema>;
  };
}

type HttpMethod = "get" | "post" | "put" | "delete";

const document = swaggerDocument as unknown as OpenApiDocument;
const schemas = document.components.schemas;

const getOperation = (path: string, method: HttpMethod): OpenApiOperation => {
  const operation = document.paths[path]?.[method];
  if(!operation) throw new Error(`Operación OpenAPI ausente: ${method.toUpperCase()} ${path}`);
  return operation;
};

const responseSchema = (path: string, method: HttpMethod, status: string): OpenApiSchema => {
  const schema = getOperation(path, method).responses[status]?.content?.["application/json"]?.schema;
  if(!schema) throw new Error(`Schema de respuesta ausente: ${method.toUpperCase()} ${path} ${status}`);
  return schema;
};

describe("Contrato OpenAPI sincronizado con Express y Zod", () => {
  test("documenta exactamente las operaciones funcionales registradas", () => {
    const expectedOperations: Record<string, HttpMethod[]> = {
      "/health": ["get"],
      "/api/auth/register": ["post"],
      "/api/auth/login": ["post"],
      "/api/auth/validate-email/{token}": ["get"],
      "/api/auth/reset-password": ["post"],
      "/api/auth/reset-password/{token}": ["get", "post"],
      "/api/auth/check-status": ["get"],
      "/admin/auth/login": ["post"],
      "/admin/auth/check-status": ["get"],
      "/admin/user": ["get", "post"],
      "/admin/user/{idUsuario}": ["get", "put", "delete"],
      "/admin/user/restore-user/{idUsuario}": ["put"],
      "/api/test-breve-estado-de-animo": ["post", "put"],
      "/api/test-breve-estado-de-animo/by-year/{year}": ["get"],
      "/api/test-breve-estado-de-animo/by-date/{year}/{month}/{day}": ["get"],
      "/api/test-breve-estado-de-animo/{year}/{month}/{day}": ["delete"],
      "/api/registro-estado-de-animo": ["post", "put"],
      "/api/registro-estado-de-animo/pendientes": ["get"],
      "/api/registro-estado-de-animo/completos": ["get"],
      "/api/registro-estado-de-animo/{idRegistro}": ["get", "delete"],
      "/api/chat-ia/new-chat": ["post"],
      "/api/chat-ia/get-chats-by-user": ["get"],
      "/api/chat-ia/get-messages-from-chat/{idChat}": ["get"],
      "/api/chat-ia/send-message-to-chat/{idChat}": ["post"],
      "/api/chat-ia/delete-chat/{idChat}": ["delete"],
    };

    expect(Object.keys(document.paths).sort()).toEqual(Object.keys(expectedOperations).sort());
    for(const [path, methods] of Object.entries(expectedOperations)) {
      const documentedMethods = Object.keys(document.paths[path] ?? {})
        .filter((method): method is HttpMethod => ["get", "post", "put", "delete"].includes(method));
      expect(documentedMethods.sort()).toEqual([...methods].sort());
    }
  });

  test("declara todos los parámetros de path con los mismos nombres que Express", () => {
    for(const [path, pathItem] of Object.entries(document.paths)) {
      const placeholders = [...path.matchAll(/\{([^}]+)\}/g)]
        .flatMap(match => match[1] ? [match[1]] : [])
        .sort();
      for(const operation of Object.values(pathItem)) {
        const documented = (operation?.parameters ?? [])
          .filter(parameter => parameter.in === "path")
          .map(parameter => parameter.name)
          .sort();
        expect(documented).toEqual(placeholders);
      }
    }
  });

  test("la restauración administrativa es alcanzable antes de PUT /:idUsuario", () => {
    interface RouterLayer {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    }

    const stack = (AdminUserRouter.routes as unknown as { stack: RouterLayer[] }).stack;
    const putPaths = stack
      .filter(layer => layer.route?.methods.put)
      .map(layer => layer.route!.path);

    expect(putPaths.indexOf("/restore-user/:idUsuario")).toBeGreaterThanOrEqual(0);
    expect(putPaths.indexOf("/restore-user/:idUsuario")).toBeLessThan(putPaths.indexOf("/:idUsuario"));
  });

  test("los DTO clínicos reflejan todos los campos obligatorios de Zod", () => {
    expect(schemas.TestBreveDto.required).toEqual(expect.arrayContaining([
      "depresion", "impulsoSuicida", "ansiedadFisica", "ansiedadEmocional", "fecha", "notas",
    ]));

    expect(schemas.RegistroEstadoAnimoDto.required).toContain("grupoEmocionesPersonalizadas");
    for(let group = 1; group <= 9; group += 1) {
      expect(schemas[`EmocionesGrupo${group}Dto`]?.required).toContain("porcentajeCreenciaDespues");
    }
    expect(schemas.EmocionesPersonalizadasDto.required).toContain("porcentajeCreenciaDespues");
    expect(schemas.PensamientoDto.required).toEqual(expect.arrayContaining([
      "porcentajeCreenciaDespues", "pensamientoPositivo", "porcentajeCreenciaPositivo",
    ]));
    expect(schemas.RegistroEstadoAnimoEditDto.allOf?.[1]?.required).toContain("id");
  });

  test("las respuestas de chat conservan los envoltorios y nombres reales", () => {
    expect(responseSchema("/api/chat-ia/get-chats-by-user", "get", "200").$ref)
      .toBe("#/components/schemas/ChatListResponse");
    expect(responseSchema("/api/chat-ia/get-messages-from-chat/{idChat}", "get", "200").$ref)
      .toBe("#/components/schemas/ChatDetailResponse");

    expect(schemas.ChatResponse.properties).toHaveProperty("idUsuario");
    expect(schemas.ChatResponse.properties).toHaveProperty("mensajes");
    expect(schemas.ChatResponse.properties).not.toHaveProperty("createdAt");
    expect(schemas.ChatMessageResponse.properties).toHaveProperty("text");
    expect(schemas.ChatMessageResponse.properties).toHaveProperty("archivos");
    expect(schemas.ChatMessageResponse.properties).not.toHaveProperty("message");
    expect(schemas.ChatMessageResponse.properties).not.toHaveProperty("files");

    const uploadSchema = getOperation(
      "/api/chat-ia/send-message-to-chat/{idChat}",
      "post",
    ).requestBody?.content["multipart/form-data"]?.schema;
    expect(uploadSchema?.properties?.files?.maxItems).toBe(5);
  });

  test("documenta todos los filtros administrativos y resuelve cada referencia local", () => {
    const filterNames = getOperation("/admin/user", "get")
      .parameters?.map(parameter => parameter.name);
    expect(filterNames).toEqual(["page", "limit", "query", "emailVerify", "rol", "state"]);

    const serialized = JSON.stringify(swaggerDocument);
    const references = [...serialized.matchAll(/#\/components\/schemas\/([A-Za-z0-9]+)/g)]
      .flatMap(match => match[1] ? [match[1]] : []);
    for(const reference of references) {
      expect(schemas[reference]).toBeDefined();
    }
  });
});
