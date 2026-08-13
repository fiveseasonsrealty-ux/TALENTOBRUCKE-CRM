import "./globals.css";

export const metadata = {
  title: "TalentoBrücke | Evaluación Profesional",
  description: "Evaluación inicial de perfiles técnicos interesados en Alemania"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
