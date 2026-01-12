import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { processPromptTemplate } from '@/lib/prompt-utils';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const flowId = process.env.FLOW_ID;

  console.log("Debug Env Vars:");
  console.log("- OPENAI_API_KEY exists:", !!apiKey);
  console.log("- FLOW_ID:", flowId ? "Exists" : "Missing");

  if (!apiKey || !flowId) {
    return NextResponse.json(
      { error: "Missing configuration variables" },
      { status: 500 }
    );
  }
  // Obtener userId del body si está presente, sino usar uno genérico
  let userId: string;
  let stateVariables: Record<string, any> = {};
  try {
    const body = await req.json().catch(() => ({}));
    userId = body.userId || 'anonymous-user';
    stateVariables = body.state || {};
  } catch {
    userId = 'anonymous-user';
  }

  // Procesar el prompt template y añadirlo a las state variables
  let processedPrompt: string | undefined;
  try {
    const templatePath = path.join(process.cwd(), 'information_hotel.md');
    const template = fs.readFileSync(templatePath, 'utf-8');
    processedPrompt = processPromptTemplate(template, stateVariables);
    
    console.log('📝 Prompt procesado. Tamaño:', processedPrompt.length, 'caracteres');
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📄 PROMPT COMPLETO PROCESADO:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(processedPrompt);
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    
    // Añadir el prompt procesado a las state variables
    stateVariables.system_prompt_information_hotel = processedPrompt;
    
    console.log('✅ Prompt añadido a state_variables como: system_prompt_information_hotel');
  } catch (error: any) {
    console.error('❌ Error processing prompt template:', error.message);
    console.error(error);
    // Continuar sin el prompt procesado si hay error
  }

  const openai = new OpenAI({ apiKey });
  const cleanFlowId = flowId.trim();
  
  // Preparar state_variables asegurando que todos los valores sean del tipo correcto
  const cleanStateVariables: Record<string, string | boolean | number> = {};
  for (const [key, value] of Object.entries(stateVariables)) {
    // Convertir a string si es muy largo o si es un objeto/array
    if (typeof value === 'string') {
      cleanStateVariables[key] = value;
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      cleanStateVariables[key] = value;
    } else {
      // Si es objeto o array, convertir a string JSON
      cleanStateVariables[key] = JSON.stringify(value);
    }
  }
  
  console.log('📦 State variables a enviar:', Object.keys(cleanStateVariables));
  if (processedPrompt) {
    console.log('📝 Prompt incluido en variables (primeros 100 chars):', processedPrompt.substring(0, 100) + '...');
    console.log('\n🔍 Valor exacto de system_prompt_information_hotel que se enviará:');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(cleanStateVariables.system_prompt_information_hotel);
    console.log('─────────────────────────────────────────────────────────────────\n');
  }

  try {
    const session = await openai.beta.chatkit.sessions.create({
      workflow: {
        id: cleanFlowId,
        ...(Object.keys(cleanStateVariables).length > 0 && {
          state_variables: cleanStateVariables,
        }),
      },
      user: userId,
    });
    
    if (!session.client_secret) {
      return NextResponse.json(
        { error: 'No client_secret received from OpenAI' },
        { status: 500 }
      );
    }
    
    console.log('✅ Session creada exitosamente');
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error: any) {
    console.error('❌ Error creating chatkit session:', error.message);
    console.error('Error details:', {
      status: error.status,
      code: error.code,
      type: error.type,
      response: error.response?.data || error.response?.body,
    });
    
    // Si el error es por el tamaño de las variables, intentar sin el prompt
    if (error.message?.includes('too large') || error.message?.includes('size limit')) {
      console.warn('⚠️ Posible error de tamaño. Intentando sin prompt...');
      try {
        const { system_prompt_information_hotel, ...variablesWithoutPrompt } = cleanStateVariables;
        const sessionRetry = await openai.beta.chatkit.sessions.create({
          workflow: {
            id: cleanFlowId,
            ...(Object.keys(variablesWithoutPrompt).length > 0 && {
              state_variables: variablesWithoutPrompt,
            }),
          },
          user: userId,
        });
        console.warn('⚠️ Session creada sin prompt. El prompt debe enviarse de otra forma.');
        return NextResponse.json({ client_secret: sessionRetry.client_secret });
      } catch (retryError: any) {
        console.error('❌ Error en reintento:', retryError.message);
      }
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create session',
        details: error.status ? `OpenAI API error: ${error.status}` : undefined,
        code: error.code,
        suggestion: processedPrompt ? 'El prompt puede ser demasiado largo para state_variables' : undefined,
      },
      { status: 500 }
    );
  }
}
