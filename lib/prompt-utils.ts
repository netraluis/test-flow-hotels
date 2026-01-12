interface HotelData {
  [key: string]: any;
  guest_services?: string | object;
  dining_venues?: string | Array<any>;
  hotel_policies?: string | Array<any>;
  breakfast_config?: string | object;
}

/**
 * Procesa un template de prompt reemplazando las variables {{variable_name}} con valores del objeto de datos
 * Esta función puede usarse tanto en servidor como en cliente
 */
export function processPromptTemplate(
  template: string,
  hotelData: HotelData
): string {
  // Parsear campos JSON si existen
  const parsedData: HotelData = { ...hotelData };

  // Parsear guest_services si es string
  if (typeof parsedData.guest_services === 'string') {
    try {
      parsedData.guest_services = JSON.parse(parsedData.guest_services);
    } catch (e) {
      console.warn('Error parsing guest_services:', e);
    }
  }

  // Parsear dining_venues si es string
  if (typeof parsedData.dining_venues === 'string') {
    try {
      parsedData.dining_venues = JSON.parse(parsedData.dining_venues);
    } catch (e) {
      console.warn('Error parsing dining_venues:', e);
    }
  }

  // Parsear hotel_policies si es string
  if (typeof parsedData.hotel_policies === 'string') {
    try {
      parsedData.hotel_policies = JSON.parse(parsedData.hotel_policies);
    } catch (e) {
      console.warn('Error parsing hotel_policies:', e);
    }
  }

  // Parsear breakfast_config si es string
  if (typeof parsedData.breakfast_config === 'string') {
    try {
      parsedData.breakfast_config = JSON.parse(parsedData.breakfast_config);
    } catch (e) {
      console.warn('Error parsing breakfast_config:', e);
    }
  }

  // Formatear dining_venues para dining_venues_formatted
  if (Array.isArray(parsedData.dining_venues)) {
    parsedData.dining_venues_formatted = parsedData.dining_venues
      .map((venue) => {
        const parts = [
          `- **${venue.name}** (${venue.type})`,
          `  - Hours: ${venue.hours}`,
          `  - Booking: ${venue.booking}`,
          venue.description ? `  - Description: ${venue.description}` : null,
          venue.menu_link ? `  - Menu: [View Menu](${venue.menu_link})` : null,
          venue.map_link ? `  - Location: [View on Map](${venue.map_link})` : null,
        ]
          .filter(Boolean)
          .join('\n');
        return parts;
      })
      .join('\n\n');
  }

  // Formatear room_amenities
  const guestServices = parsedData.guest_services as any;
  if (guestServices?.room_amenities && Array.isArray(guestServices.room_amenities)) {
    parsedData['guest_services.room_amenities_formatted'] = guestServices.room_amenities
      .map((item: string) => `- ${item}`)
      .join('\n');
  }

  // Formatear shared_facilities
  if (guestServices?.shared_facilities && Array.isArray(guestServices.shared_facilities)) {
    parsedData['guest_services.shared_facilities_formatted'] = guestServices.shared_facilities
      .map((item: string) => `- ${item}`)
      .join('\n');
  }

  // Formatear housekeeping
  if (guestServices?.housekeeping) {
    parsedData['housekeeping.frequency'] = guestServices.housekeeping.frequency || '';
    parsedData['housekeeping.service_window'] = guestServices.housekeeping.service_window || '';
    parsedData['housekeeping.policy_note'] = guestServices.housekeeping.policy_note || '';
  }

  // Formatear guest_services properties
  if (guestServices) {
    parsedData['guest_services.wifi'] = guestServices.wifi || '';
    parsedData['guest_services.laundry'] = guestServices.laundry || '';
    parsedData['guest_services.housekeeping'] = guestServices.housekeeping?.frequency || '';
  }

  // Formatear hotel_policies como house_rules
  if (Array.isArray(parsedData.hotel_policies)) {
    parsedData.house_rules = parsedData.hotel_policies
      .map((policy: any) => {
        const severity = policy.severity ? ` **[${policy.severity}]**` : '';
        return `- **${policy.topic}**${severity}: ${policy.rule}`;
      })
      .join('\n');
  }

  // Extraer restaurant_name del primer dining venue
  if (Array.isArray(parsedData.dining_venues) && parsedData.dining_venues.length > 0) {
    parsedData.restaurant_name = parsedData.dining_venues[0].name || '';
    parsedData.restaurant_phone = parsedData.dining_venues[0].phone || parsedData.hotel_phone || '';
  } else {
    parsedData.restaurant_phone = parsedData.hotel_phone || '';
  }

  // Función para obtener valor de propiedades anidadas usando notación de punto
  const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '';
      }
    }
    return value != null ? String(value) : '';
  };

  // Reemplazar todas las variables {{variable_name}} en el template
  let processedTemplate = template.replace(/\{\{([^}]+)\}\}/g, (match, variablePath) => {
    const trimmedPath = variablePath.trim();
    
    // Buscar primero en propiedades directas
    if (trimmedPath in parsedData) {
      const value = parsedData[trimmedPath];
      return value != null ? String(value) : '';
    }
    
    // Buscar en propiedades anidadas
    const nestedValue = getNestedValue(parsedData, trimmedPath);
    if (nestedValue) {
      return nestedValue;
    }
    
    // Si no se encuentra, dejar la variable como está (o devolver string vacío)
    console.warn(`Variable ${trimmedPath} not found in hotel data`);
    return '';
  });

  return processedTemplate;
}


