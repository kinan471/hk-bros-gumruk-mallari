import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniCartLoader from "@/components/layout/MiniCartLoader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <MiniCartLoader />
    </>
  );
}