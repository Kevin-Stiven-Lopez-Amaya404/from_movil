
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Crea un archivo CSV temporal y abre el menu
 * nativo de Android/iOS para compartirlo o guardarlo.
 */
export async function shareConsumptionCsv(
  csvContent: string,
): Promise<void> {
  if (!csvContent.trim()) {
    throw new Error("No hay contenido para exportar.");
  }

  const sharingAvailable = await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "La exportacion de archivos no esta disponible en este dispositivo.",
    );
  }

  // Nombre unico sin datos personales del usuario.
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const fileName = `smarthome-consumo-${timestamp}.csv`;

  // Archivo temporal: no se guardan informes en el servidor.
  const file = new File(Paths.cache, fileName);

  file.create({ overwrite: true });
  await file.write(csvContent);

  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    dialogTitle: "Compartir informe de consumo",
  });
}
