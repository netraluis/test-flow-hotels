import { MyCustomChat } from './components/MyCustomChat';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-100">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col mb-8">
        <h1 className="text-4xl font-bold mb-2 text-blue-800">Hotel Micolau</h1>
        <p className="text-gray-600">Posición del mapa (latitud: 42.5709392 y longitud 1.4724762)</p>
      </div>
      
      <div className="w-full max-w-2xl">
        <MyCustomChat />
      </div>
    </main>
  );
}