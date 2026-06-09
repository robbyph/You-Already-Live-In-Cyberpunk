import CircuitBoardBg from "@/components/CircuitBoardBg";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CircuitBoardBg />
        {children}
      </body>
    </html>
  );
}
