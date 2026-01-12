"use client";
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { processPromptTemplate } from '@/lib/prompt-utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

// Datos del hotel (extraídos para reutilización)
const HOTEL_DATA = {
  name_place: 'Hotel Micolau',
  latitude: '42.5709392',
  longitude: '1.4724762',
  hotel_name: "Hotel Micolau",
  hotel_phone: "+376 339 515",
  hotel_email: "bookings@hotelmicolau.com",
  website_url: "https://hotelmicolau.com/",
  hotel_vibe: "Historic stone building with traditional Andorran architecture. Very cozy, rustic, and family-friendly.",
  target_audience: "Families, Skiers (Ski-in location), and Hikers looking for authenticity.",
  key_highlights: "Located directly next to the Arinsal cable car. Building dates back to the 19th century.",
  elevator_status: "NO ELEVATOR. This is a protected historic building. Access to upper floors is via stairs only.",
  heating_status: "Central heating available in all rooms.",
  ac_status: "No Air Conditioning (cool mountain breeze usually sufficient in summer).",
  parking_situation: "Blue zone street parking available. Public communal parking nearby.",
  reception_location: "**Apartamentos Sant Moritz** (Building with the red door, directly opposite Hotel Micolau).",
  reception_hours: "09:00 - 13:00 & 15:00 - 20:00",
  check_in_time: "15:30 - 20:00",
  check_out_time: "11:00",
  late_arrival_instructions: "**MANDATORY**: You must contact us in advance if arriving after 20:00. We will provide a code for the key-box.",
  check_in_docs_deposit: "Valid Passport/ID for all guests (including children). Credit card required as guarantee.",
  luggage_policy: "Free storage available at Sant Moritz reception during opening hours.",
  direct_booking_perk: "**Free Late Check-out** (until 17:00, subject to availability) when booking on our website.",
  booking_url: "https://direct-book.com/properties/hotelmicolaudirect?locale=es",
  booking_promo_info: "Best price guaranteed on our official website.",
  extra_fees_structure: "Tourist Tax: **1.57€ per person/night** (over 16 years old). Paid at hotel.",
  payment_accepted: "Visa, Mastercard, Cash (Euros).",
  payment_not_accepted: "Amex (American Express), Diners Club.",
  deposit_policy: "No security deposit charged upfront, but a valid credit card is required for guarantee.",
  cancellation_policy: "Standard: Free cancellation up to 7 days before arrival. Non-Refundable: 100% charged at booking.",
  children_bed_policy: "Cots available for babies upon request. No capacity for extra beds in standard rooms.",
  breakfast_config: JSON.stringify({
    served_at: "California Grill (Ground Floor)",
    hours: "08:00 - 10:00",
    price_type: "Buffet style. Included in 'Bed & Breakfast' rate, otherwise 12€/person.",
    dietary_options: "Gluten-free bread and milk alternatives available on request."
  }),
  room_service_policy: "**Not available**.",
  dining_venues: JSON.stringify([
    {
      name: "California Grill",
      type: "Dinner / Steakhouse",
      hours: "16:00 - 22:30 (Closed for lunch)",
      booking: "Reservation Recommended.",
      description: "Tex-Mex specialties and grilled meats in a historic setting.",
      menu_link: "https://drive.google.com/file/d/1Q7_CeWgh2CMT8O5sdtBoFzQ4WmD2mF8O/view?usp=sharing",
      map_link: "https://www.google.com/maps/place/California+Grill/@42.5719559,1.4818192,17z/data=!3m1!4b1!4m10!3m9!1s0x12af5f3ea2ac970b:0x5aa3f6d6a3b15e3a!5m3!1s2024-05-01!4m1!1i2!8m2!3d42.571952!4d1.4843941!16s%2Fg%2F11lkdn7j91?entry=tts"
    }
  ]),
  guest_services: JSON.stringify({
    wifi: "Free High-Speed Wi-Fi in all rooms and common areas.",
    laundry: "No laundry service. Iron and ironing board available at reception on request.",
    housekeeping: {
      frequency: "Daily cleaning service.",
      service_window: "09:30 - 13:30",
      policy_note: "Towels changed only if left on the floor. DND signs respected until 13:30."
    },
    room_amenities: [
      "Flat Screen TV",
      "Kettle (Tea/Coffee)",
      "Hairdryer",
      "Heating Radiators",
      "En-suite Bathroom (Bathtub or Shower)",
      "Free Toiletries"
    ],
    shared_facilities: [
      "Ski Lockers (Ground Floor)",
      "Reading Lounge",
      "Bar Area"
    ]
  }),
  hotel_policies: JSON.stringify([
    {
      topic: "Winter Access (Car)",
      rule: "From Nov 15 to Apr 15, snow chains or winter tires are MANDATORY to reach Arinsal.",
      severity: "CRITICAL"
    },
    {
      topic: "Ski Equipment",
      rule: "Ski boots and equipment are STRICTLY PROHIBITED inside the rooms or hallways. Please use the lockers provided.",
      severity: "HIGH"
    },
    {
      topic: "Smoking",
      rule: "Smoking is prohibited in all interior areas. Fine: 200€.",
      severity: "HIGH"
    },
    {
      topic: "Pets",
      rule: "Pets are not allowed in the hotel.",
      severity: "MEDIUM"
    }
  ]),
};

/**
 * Genera el prompt procesado aplicando las variables del hotel al template
 * @param template - El template del prompt con variables {{variable_name}}
 * @returns El prompt procesado con todas las variables reemplazadas
 */
export function generateProcessedPrompt(template: string): string {
  return processPromptTemplate(template, HOTEL_DATA);
}

export function MyCustomChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingUserMessageRef = useRef<string | null>(null);
  const threadIdRef = useRef<string | null>(null);

  const loadingMessages = [
    'Pensando...',
    'Buscando tu respuesta...',
    'Buscando la mejor ruta...',
  ];

  // justo después de los refs
  const loadMessages = useCallback(async (threadId: string) => {
    try {
      console.log('📥 Cargando mensajes para thread:', threadId);
      const res = await fetch(`/api/chatkit/thread/${threadId}/messages`);
      
      if (!res.ok) {
        console.error('❌ Error en la respuesta del servidor:', res.status, res.statusText);
        return;
      }
      
      const data = await res.json();
      console.log('🔍 Mensajes recibidos del API:', data);
      console.log('🔍 Cantidad de mensajes:', data.messages?.length || 0);
      
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        const formattedMessages = data.messages
          .map((msg: any) => {
            // Normalizar el contenido - puede venir como string o como objeto
            let content = '';
            if (typeof msg.content === 'string') {
              content = msg.content;
            } else if (typeof msg.text === 'string') {
              content = msg.text;
            } else if (msg.content && typeof msg.content === 'object') {
              // Si viene como objeto, convertirlo a string JSON
              content = JSON.stringify(msg.content);
            } else {
              content = String(msg.content || msg.text || '');
            }
            
            console.log('📝 Procesando mensaje:', { 
              id: msg.id, 
              role: msg.role, 
              contentLength: content.length,
              contentPreview: content.substring(0, 100),
              contentType: typeof msg.content
            });
            
            // Si es mensaje del usuario, siempre incluirlo
            if (msg.role === 'user') {
              return {
                id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                text: content,
                isUser: true,
              };
            }
            
            // Para mensajes del asistente, verificar si es un JSON interno que no debe mostrarse
            // Solo procesar si el contenido no está vacío y es un string
            if (content && typeof content === 'string' && content.trim().length > 0) {
              try {
                // Intentar parsear solo si parece JSON (empieza con { o [)
                const trimmedContent = content.trim();
                const looksLikeJson = (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) || 
                                     (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'));
                if (looksLikeJson) {
                  const parsed = JSON.parse(content);
                  // Si es un objeto con 'intent' pero no tiene 'response' ni es un tipo reconocido,
                  // es probablemente un mensaje interno del workflow que no debe mostrarse
                  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.intent) {
                    // Solo ocultar si NO es un intent finish con response, y NO es un tipo de card reconocido
                    const isWeather = parsed.type === 'weather';
                    const isPlacesNear = parsed.type === 'places_near';
                    const isRoute = parsed.type === 'calculate_distance';
                    const isActivities = parsed.type === 'activities';
                    const hasResponse = parsed.response && typeof parsed.response === 'string';
                    const isFinishIntent = parsed.intent === 'finish';
                    
                    // Solo filtrar si tiene intent pero no es un tipo reconocido ni tiene response
                    if (!isWeather && !isPlacesNear && !isRoute && !isActivities && !hasResponse) {
                      console.log('🚫 Filtrando mensaje interno:', parsed.intent, 'type:', parsed.type);
                      return null; // Filtrar este mensaje
                    }
                  }
                }
              } catch (e) {
                // No es JSON válido, está bien mostrarlo como texto
                // En producción puede haber diferentes formatos, mejor dejarlo pasar
              }
            }
            
            return {
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              text: content,
              isUser: false,
            };
          })
          .filter(Boolean); // Eliminar mensajes null
        console.log('✅ Mensajes formateados (total:', formattedMessages.length, '):', formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.warn('⚠️ No se recibieron mensajes del servidor. Respuesta:', data);
      }
    } catch (err) {
      console.error('❌ Error loading messages:', err);
    }
  }, []);



  const chatKit = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // implement session refresh
        }

        console.log('🔑 [ChatKit] Getting client secret...');
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'micolau-user',
            state: HOTEL_DATA,
          }),
        });
        const { client_secret } = await res.json();
        console.log('🔑 [ChatKit] Client secret received', client_secret);
        return client_secret;
      },
    },
    onResponseStart: () => {
      setIsLoading(true);
    },
    onResponseEnd: async () => {
      console.log('✅ onResponseEnd - threadId actual:', threadIdRef.current);
      setIsLoading(false);
      // Esperar un momento para asegurar que onThreadChange haya actualizado el threadId
      // Esto es especialmente importante después de reiniciar la conversación
      const maxAttempts = 20;
      let attempts = 0;
      
      const tryLoadMessages = async () => {
        const currentThreadId = threadIdRef.current;
        if (currentThreadId) {
          console.log(`📥 Cargando mensajes desde onResponseEnd para thread: ${currentThreadId} (intento ${attempts + 1})`);
          await loadMessages(currentThreadId);
          
          // Si aún no hemos intentado muchas veces, hacer otro intento después de un delay
          // Esto es útil para flows que pueden tardar más tiempo
          if (attempts < 3) {
            attempts++;
            setTimeout(() => {
              console.log(`🔄 Reintentando carga de mensajes... (intento ${attempts + 1})`);
              tryLoadMessages();
            }, 1500);
          }
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`⏳ Esperando threadId... (intento ${attempts}/${maxAttempts})`);
          setTimeout(tryLoadMessages, 300);
        } else {
          console.warn('⚠️ No se pudo cargar los mensajes: threadId no disponible después de onResponseEnd');
        }
      };
      
      // Aumentar el delay inicial para dar tiempo al flow de completarse
      setTimeout(tryLoadMessages, 800);
    },
    onError: (event: { error: Error }) => {
      console.error('ChatKit error:', event.error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
    onThreadChange: async (event: { threadId: string | null }) => {
      const threadId = event.threadId;
      console.log('🔄 onThreadChange - nuevo threadId:', threadId);
      threadIdRef.current = threadId;
      setCurrentThreadId(threadId);
      if (!threadId) {
        console.log('🧹 Limpiando mensajes (threadId es null)');
        setMessages([]);
      } else {
        // Cargar mensajes cuando cambia el thread (incluyendo nuevo thread después de reset)
        // Esperar un momento para asegurar que los mensajes estén disponibles en el servidor
        console.log('📥 onThreadChange - programando carga de mensajes para thread:', threadId);
        setTimeout(async () => {
          console.log('📥 onThreadChange - cargando mensajes ahora para thread:', threadId);
          await loadMessages(threadId);
          
          // Intentar cargar de nuevo después de un tiempo adicional por si el flow tarda
          setTimeout(async () => {
            console.log('🔄 onThreadChange - segunda carga de mensajes (por si el flow tardó más)');
            await loadMessages(threadId);
          }, 2000);
        }, 800);
      }
    },
  });

  const { control, sendUserMessage, fetchUpdates, ref } = chatKit;

  useEffect(() => {
    console.log('🔑 [ChatKit] Control object:', chatKit);
  }, [chatKit]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Efecto para rotar mensajes de carga
  useEffect(() => {
    if (!isLoading) {
      setLoadingMessage(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Cambia cada 2 segundos

    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    pendingUserMessageRef.current = textToSend;
    setInputValue('');
    setIsLoading(true);

    try {
      // Enviar mensaje solo a ChatKit usando el control
      // La respuesta se extraerá automáticamente en onResponseEnd
      const wasNewConversation = !threadIdRef.current;
      await sendUserMessage({
        text: textToSend,
      });
      
      // Los mensajes se cargarán automáticamente a través de onThreadChange y onResponseEnd
      // No necesitamos cargar manualmente aquí para evitar duplicaciones
      console.log('📤 Mensaje enviado. Esperando respuesta...');
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al enviar tu mensaje.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const suggestedQuestions = [
    '¿Cómo puedo llegar al hotel?',
    '¿Cómo puedo reservar una habitación en Hotel Micolau?',
    '¿Hay spa o zona de relax?',
    '¿A qué distancia está el hotel de las pistas de esquí?',
  ];

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl h-full flex-1">
      <div className="absolute opacity-0 pointer-events-none -z-10" style={{ width: '1px', height: '1px', overflow: 'hidden' }}>
        <ChatKit control={control} className="h-[600px] w-full" />
      </div>

      <div className="flex flex-col bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden h-full flex-1">
        {/* Header del chat */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">C</span>
            </div>
            <span className="text-sm font-medium text-zinc-900">Cecilia</span>
          </div>
        </div>
        
        <div className={`flex-1 overflow-y-auto p-4 bg-zinc-50/50 ${messages.length === 0 ? 'flex flex-col' : 'space-y-4'}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-end h-full gap-4 pb-4">
              <div className="text-zinc-500 text-sm mb-2 w-full max-w-2xl">Elige una pregunta para comenzar:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading}
                    className="text-left p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-900 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-sm text-zinc-700 group-hover:text-zinc-900 font-medium">
                      {question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  text={message.text}
                  isUser={message.isUser}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-zinc-600 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                    </div>
                    <span className="ml-1 animate-pulse">{loadingMessages[loadingMessage]}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-200 bg-white">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            disabled={isLoading}
            placeholder="Escribe un mensaje..."
          />
        </div>
      </div>
    </div>
  );
}