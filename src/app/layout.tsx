export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="grid-wave" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
