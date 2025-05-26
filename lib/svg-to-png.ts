import { Canvg } from "canvg";

export async function svgToPng(svgString: string, width: number, height: number): Promise<string> {
  // Crear un elemento SVG
  const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement;
  
  // Crear un canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Obtener el contexto 2D
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto 2D del canvas');
  }
  
  // Crear una imagen a partir del SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Dibujar la imagen en el canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir el canvas a PNG
      const pngUrl = canvas.toDataURL('image/png');
      
      // Limpiar
      URL.revokeObjectURL(url);
      
      resolve(pngUrl);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar la imagen SVG'));
    };
    
    img.src = url;
  });
}

// Función para convertir un SVG a PNG y devolverlo como base64
export async function convertSvgToPngBase64(svgString: string, width: number, height: number): Promise<string> {
  try {
    const pngUrl = await svgToPng(svgString, width, height);
    // Extraer la parte base64 del data URL
    return pngUrl.split(',')[1];
  } catch (error) {
    console.error('Error al convertir SVG a PNG:', error);
    throw error;
  }
}

// Función para generar un PNG a partir de un SVG y devolverlo como URL
export async function generatePngUrl(svgString: string, width: number, height: number): Promise<string> {
  try {
    const base64 = await convertSvgToPngBase64(svgString, width, height);
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error al generar URL PNG:', error);
    throw error;
  }
}

export async function svgToPngBlob(
  svgString: string,
  color: string,
  size = 15,
  background: "light" | "dark" = "light"
): Promise<Blob> {
  const coloredSvg = svgString.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  // Dibuja el fondo opaco antes del SVG
  ctx.fillStyle = background === "dark" ? "#000000" : "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  const v = await Canvg.fromString(ctx, coloredSvg);
  await v.render();

  return await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/png"));
} 