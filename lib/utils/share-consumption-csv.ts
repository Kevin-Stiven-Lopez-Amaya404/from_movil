
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Creates a temporary CSV file and opens the native
 * Android/iOS menu to share or save it.
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

  // Unique name without the user's personal data.
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const fileName = `smarthome-consumo-${timestamp}.csv`;

  // Temporary file: no reports are stored on the server.
  const file = new File(Paths.cache, fileName);

  file.create({ overwrite: true });
  await file.write(csvContent);

  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    dialogTitle: "Compartir informe de consumo",
  });
}
