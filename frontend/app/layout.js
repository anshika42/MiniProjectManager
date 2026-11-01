import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Mini Project Manager",
  description: "A simple place to organize your projects and tasks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
