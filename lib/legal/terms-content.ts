export type TermsSection = {
  title: string;
  paragraphs: readonly string[];
};

export const TERMS_TITLE = "DOCUMENTO DE TÉRMINOS Y CONDICIONES DE USO";
export const TERMS_SUBTITLE = "Plataforma Smart Home · Proyecto formativo ADSO";
export const TERMS_VERSION = "2.0";
export const TERMS_DATE = "18 de octubre de 2026";
export const TERMS_STATUS = "APROBADO · Versión Final para Entrega Ficha 3145555";

export const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    title: "Objeto y carácter del proyecto",
    paragraphs: [
      "Estas condiciones regulan el acceso y uso de Smart Home, un prototipo tecnológico de Internet de las Cosas (IoT) desarrollado como proyecto formativo del programa Análisis y Desarrollo de Software (ADSO) de la Ficha 3145555 del Servicio Nacional de Aprendizaje (SENA). La referencia al SENA identifica el contexto académico del proyecto y no implica, por sí sola, que la institución sea la operadora, responsable contractual o garante del servicio.",
      "El operador del servicio y equipo responsable del proyecto está conformado por los integrantes: Karen Daniela Holguín Cruz, Natalia Chala Chala y Kevin Stiven López Amaya.",
      "Canales oficiales de contacto y soporte técnico para el proyecto:",
      "Correo de Karen Daniela Holguín: klddaniela8@gmail.com",
      "Correo de Natalia Chala: nataliachala479@gmail.com",
      "Correo de Kevin Stiven López: Kevinytkevinyt3@gmail.com",
    ],
  },
  {
    title: "Funcionalidades y alcance real",
    paragraphs: [
      "Smart Home permite, según las funciones efectivamente habilitadas en la versión utilizada: administrar hogares y sus integrantes, consultar estados de dispositivos IoT compatibles, enviar comandos de control, visualizar mediciones de potencia y consumo, y recibir avisos asociados con el funcionamiento de la plataforma.",
      "El soporte de dispositivos —incluidos modelos ESP32 o Shelly 1PM Gen4— depende de su compatibilidad, configuración, conectividad y validación técnica. La inclusión de un modelo en la documentación no constituye garantía de vinculación, operación continua ni disponibilidad de todas las funciones.",
      "Las mediciones de consumo (por ejemplo, kWh) pueden corresponder solo a cargas o dispositivos monitoreados y no necesariamente al consumo total del inmueble. Las estimaciones monetarias en COP, si se muestran, son orientativas y no reemplazan las lecturas, facturas o tarifas oficiales del prestador del servicio de energía.",
    ],
  },
  {
    title: "Registro y aceptación",
    paragraphs: [
      "Para registrarse, el usuario deberá proporcionar los datos efectivamente solicitados por la aplicación, como nombre, correo electrónico y contraseña, y mantenerlos actualizados. No se exige documento de identidad como condición general de registro salvo que la aplicación lo incorpore legítimamente y se informe su finalidad.",
      "La aceptación de estos Términos se solicitará mediante una acción afirmativa verificable en el registro. El texto íntegro estará disponible antes de aceptar. La autorización para tratar datos personales se gestionará de manera diferenciada y de conformidad con la Política de Tratamiento de Datos Personales.",
      "Quien carezca de capacidad legal para aceptar estas condiciones deberá actuar mediante su representante cuando corresponda. La puesta a disposición del servicio para niños, niñas y adolescentes exige una evaluación y controles específicos previos.",
    ],
  },
  {
    title: "Seguridad de la cuenta",
    paragraphs: [
      "Cada usuario debe custodiar sus credenciales, no compartirlas indebidamente y comunicar por los correos oficiales (klddaniela8@gmail.com, nataliachala479@gmail.com, Kevinytkevinyt3@gmail.com) cualquier indicio de acceso no autorizado. Smart Home implementa controles técnicos de autenticación y autorización mediante tokens JWT en la medida descrita por su versión desplegada; tales controles reducen riesgos, pero no garantizan ausencia absoluta de incidentes.",
      "El operador debe aplicar medidas de seguridad razonables, gestionar incidentes y mantener procedimientos de recuperación, activación y reactivación de cuentas. La responsabilidad por usos no autorizados se analizará según sus causas y la legislación aplicable, sin atribuirla automáticamente y en todos los casos al usuario.",
    ],
  },
  {
    title: "Hogares, integrantes y permisos",
    paragraphs: [
      "Cada hogar puede tener integrantes con roles de acceso tales como OWNER, MEMBER y GUEST. Las acciones autorizadas dependen del rol y de las reglas vigentes aplicadas por el servidor; la apariencia de un botón no otorga permisos por sí sola.",
      "El propietario del hogar debe invitar solamente a personas autorizadas. Un integrante autorizado podrá consultar la información que su rol permita, incluidos determinados datos de dispositivos y consumo. Al retirar a una persona o revocar el acceso, podrán cambiar de inmediato sus facultades de consulta y control conforme a la implementación disponible.",
    ],
  },
  {
    title: "Dispositivos, conectividad y operación remota",
    paragraphs: [
      "La operación de dispositivos depende de suministro eléctrico, redes locales, Internet, servicios MQTT y compatibilidad del hardware. La publicación o recepción de un comando no prueba necesariamente que el dispositivo físico lo haya ejecutado; el usuario deberá verificar el estado cuando la operación tenga consecuencias relevantes.",
      "El usuario solo debe asociar dispositivos sobre los que tenga autorización. No debe intentar vincular equipos de terceros, eludir mecanismos de seguridad ni utilizar Smart Home para causar daños o interrupciones.",
    ],
  },
  {
    title: "Seguridad eléctrica y uso responsable",
    paragraphs: [
      "Los relés y actuadores (como el módulo ESP32 y el Shelly 1PM Gen4) pueden intervenir cargas eléctricas potencialmente peligrosas. La instalación, mantenimiento y revisión de conexiones a la red eléctrica deben realizarse por personal competente y conforme a los reglamentos técnicos y manuales aplicables.",
      "Smart Home no sustituye protecciones eléctricas, dispositivos de seguridad certificados, mantenimiento preventivo ni supervisión humana. No se debe depender exclusivamente de la aplicación para controlar cargas críticas o situaciones en las que una falla pueda causar lesiones, incendio o daños graves.",
    ],
  },
  {
    title: "Alertas, indicadores y reportes",
    paragraphs: [
      "Las alertas, notificaciones, estadísticas y reportes dependen de la recepción y calidad de los datos enviados por dispositivos o servicios asociados. Pueden existir demoras, interrupciones, valores incompletos o mediciones inexactas. Estos elementos son informativos y no constituyen un servicio de vigilancia, emergencia, aseguramiento o certificación de instalaciones.",
    ],
  },
  {
    title: "Usos no permitidos",
    paragraphs: [
      "Se prohíbe: acceder sin autorización a cuentas o dispositivos; manipular controles de seguridad; extraer información ajena; enviar instrucciones que comprometan la integridad de personas o equipos; interferir deliberadamente con el servicio; o utilizarlo para actividades contrarias a la ley.",
      "Las medidas de suspensión o limitación de acceso deberán ser proporcionadas, documentadas cuando corresponda y sujetas a las garantías legales aplicables.",
    ],
  },
  {
    title: "Disponibilidad y cambios técnicos",
    paragraphs: [
      "Por su naturaleza de proyecto formativo y desarrollo progresivo, Smart Home puede experimentar mantenimiento, interrupciones, cambios de características o indisponibilidad temporal. El operador procurará informar sobre interrupciones relevantes por los canales disponibles, sin prometer una disponibilidad que no esté contractual y técnicamente soportada.",
    ],
  },
  {
    title: "Desactivación, reactivación y cierre de cuenta",
    paragraphs: [
      "El usuario podrá utilizar los mecanismos de desactivación, recuperación y reactivación efectivamente habilitados. La desactivación no significa necesariamente eliminación inmediata de todos los datos, especialmente cuando existan registros relacionados con hogares compartidos, históricos o requisitos legítimos de conservación.",
      "Las solicitudes de supresión, revocación de autorización y acceso a información se tramitarán conforme a la Política de Tratamiento de Datos Personales y la ley aplicable. No se prometerá borrado irreversible ni plazos de conservación no confirmados técnicamente.",
    ],
  },
  {
    title: "Tratamiento de datos personales",
    paragraphs: [
      "El tratamiento de nombres, correos electrónicos, datos de cuenta, información sobre hogares, dispositivos y telemetría se rige por la Política de Tratamiento de Datos Personales de Smart Home, documento independiente y accesible desde el registro y la configuración.",
      "Los controles de acceso y aislamiento de información implementados mediante políticas Row Level Security (RLS) en PostgreSQL, garantizan el aislamiento de datos por usuario y hogar. No se presume que Smart Home recopile datos biométricos por el hecho de procesar telemetría.",
    ],
  },
  {
    title: "Responsabilidad y límites aplicables",
    paragraphs: [
      "El uso de una plataforma experimental puede comportar riesgos de conectividad, errores de software y diferencias entre comandos y respuesta física. Estas condiciones no excluyen ni reducen derechos irrenunciables del usuario, obligaciones de seguridad, responsabilidades derivadas de actuaciones negligentes ni otras responsabilidades que no puedan limitarse legalmente.",
      "La responsabilidad por defectos, incidentes o daños se determinará de acuerdo con los hechos y el marco normativo aplicable. No se atribuye automáticamente al SENA responsabilidad por el servicio debido a la sola vinculación académica del proyecto.",
    ],
  },
  {
    title: "Actualización de los términos",
    paragraphs: [
      "Los cambios del documento se identificarán con número de versión y fecha. Las modificaciones sustanciales se comunicarán por medios razonables antes de su aplicación, cuando corresponda, y se solicitará nueva aceptación cuando sea legalmente exigible o cambie materialmente la relación con el usuario.",
    ],
  },
  {
    title: "Contacto, ley aplicable y vigencia",
    paragraphs: [
      "Operadores / Responsables del Proyecto: Karen Daniela Holguín Cruz, Natalia Chala Chala y Kevin Stiven López Amaya (Ficha 3145555 - ADSO).",
      "Correos de Soporte y Contacto: klddaniela8@gmail.com, nataliachala479@gmail.com, Kevinytkevinyt3@gmail.com.",
      "Ley Aplicable: La operación del servicio y las relaciones que correspondan se sujetarán a la normativa colombiana aplicable (incluyendo la Ley 1581 de 2012 y el Decreto 1074 de 2015), sin desconocer derechos irrenunciables.",
      "Versión: 2.0 (Versión Final Aprobada). Fecha de elaboración: 18 de octubre de 2026. Entrada en vigor: Octubre de 2026.",
      "Aval Institucional: José de Jesús Motta Vargas (Instructor Técnico ADSO — SENA Ficha 3145555).",
    ],
  },
];
