export interface RegistroEstadoAnimoDB {
    id:                             string;
    idUsuario:                      string;
    fecha:                          Date;
    sucesoTrastornador:             string;
    grupoEmociones1:                GrupoEmociones1DB;
    grupoEmociones2:                GrupoEmociones2DB;
    grupoEmociones3:                GrupoEmociones3DB;
    grupoEmociones4:                GrupoEmociones4DB;
    grupoEmociones5:                GrupoEmociones5DB;
    grupoEmociones6:                GrupoEmociones6DB;
    grupoEmociones7:                GrupoEmociones7DB;
    grupoEmociones8:                GrupoEmociones8DB;
    grupoEmociones9:                GrupoEmociones9DB;
    grupoEmocionesPersonalizadas:   GrupoEmocionesPersonalizadasDB;
    pensamientos:                   PensamientoDB[];
}

export interface GrupoEmociones1DB {
    id:                        number;
    triste:                    boolean;
    melancolico:               boolean;
    deprimido:                 boolean;
    decaido:                   boolean;
    infeliz:                   boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones2DB {
    id:                        number;
    angustiado:                boolean;
    preocupado:                boolean;
    conPanico:                 boolean;
    nervioso:                  boolean;
    asustado:                  boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones3DB {
    id:                        number;
    culpable:                  boolean;
    conRemordimiento:          boolean;
    malo:                      boolean;
    avergonzado:               boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones4DB {
    id:                        number;
    inferior:                  boolean;
    sinValor:                  boolean;
    inadecuado:                boolean;
    deficiente:                boolean;
    incompetente:              boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones5DB {
    id:                        number;
    solitario:                 boolean;
    noQuerido:                 boolean;
    noDeseado:                 boolean;
    rechazado:                 boolean;
    solo:                      boolean;
    abandonado:                boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones6DB {
    id:                        number;
    turbado:                   boolean;
    tonto:                     boolean;
    humillado:                 boolean;
    apurado:                   boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones7DB {
    id:                        number;
    desesperanzado:            boolean;
    desanimado:                boolean;
    pesimista:                 boolean;
    descorazonado:             boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones8DB {
    id:                        number;
    frustrado:                 boolean;
    atascado:                  boolean;
    chasqueado:                boolean;
    derrotado:                 boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmociones9DB {
    id:                        number;
    airado:                    boolean;
    enfadado:                  boolean;
    resentido:                 boolean;
    molesto:                   boolean;
    irritado:                  boolean;
    trastornado:               boolean;
    furioso:                   boolean;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    registroEstadoAnimoId: string;
}

export interface GrupoEmocionesPersonalizadasDB {
    id:                        number;
    porcentajeCreenciaAntes:   number;
    porcentajeCreenciaDespues: null;
    listaEmociones:            ListaEmocionesDB[];
    registroEstadoAnimoId: string;
}

export interface ListaEmocionesDB {
    id:                             number;
    descripcion:                    string;
    grupoEmocionesPersonalizadasId: number;
}

export interface PensamientoDB {
    id:                         number;
    pensamientoNegativo:        string;
    porcentajeCreenciaAntes:    number;
    porcentajeCreenciaDespues:  null;
    pensamientoPositivo:        null;
    porcentajeCreenciaPositivo: null;
    registroEstadoAnimoId:      string;
    distorsion:                 DistorsionDB;
}

export interface DistorsionDB {
    id:                         number;
    pensamientoTodoONada:       boolean;
    generalizacionExcesiva:     boolean;
    filtroMental:               boolean;
    descargarLoPositivo:        boolean;
    saltarAConclusiones:        boolean;
    magnificacionOMinimizacion: boolean;
    razonamientoEmocional:      boolean;
    afirmacionesDelTipoDeberia: boolean;
    ponerEtiquetas:             boolean;
    inculpacion:                boolean;
    pensamientoId:              number;
}

