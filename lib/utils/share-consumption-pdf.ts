
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export async function shareConsumptionPdf(
  html: string,
): Promise<void> {
  if (!html.trim()) {
    throw new Error(
      "No hay contenido disponible para generar el informe PDF.",
    );
  }

  const sharingAvailable = await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "Este dispositivo no permite compartir archivos PDF.",
    );
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (!uri) {
    throw new Error("No se pudo generar el archivo PDF.");
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Compartir informe de consumo",
    UTI: "com.adobe.pdf",
  });
}