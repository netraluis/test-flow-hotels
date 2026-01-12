import { MyCustomChat } from './components/MyCustomChat';
import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function Home() {
  // Coordenadas del hotel para el mapa
  // const hotelLatitude = 42.5709392;
  // const hotelLongitude = 1.4724762;

  return (
    <>
      {/* Header fijo en la parte superior */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-gray-100 border-b border-zinc-200 ${inter.variable} font-sans`}>
        <div className="max-w-5xl w-full mx-auto px-8 md:px-24 py-4 flex items-center">
          {/* Logo del Hotel - pequeño y a la izquierda */}
          <Image
            src="https://hotelmicolau.com/wp-content/uploads/2025/01/Hotel-Micolau-banner.webp"
            alt="Hotel Micolau Logo"
            width={150}
            height={50}
            className="h-auto w-auto object-contain"
            priority
          />
          
          {/* Coordenadas comentadas - solo para referencia de desarrollo */}
          {/* <p className="text-gray-600 text-xs mt-2 opacity-60">Posición del mapa (latitud: 42.5709392 y longitud 1.4724762)</p> */}
        </div>
      </header>

      <main className="flex flex-col items-center pt-20 md:pt-24 px-8 md:px-24 bg-gray-100 min-h-screen">
        <div className="w-full max-w-2xl h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex flex-col">
          <MyCustomChat />
        </div>
      </main>
    </>
  );
}