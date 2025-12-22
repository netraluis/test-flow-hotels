import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'La API de ChatKit no expone un método para listar workflows.',
    instructions: {
      step1: 'Ve a https://platform.openai.com/chatkit',
      step2: 'Abre tu proyecto/workflow',
      step3: 'El Flow ID aparece en la URL o en la configuración del workflow',
      step4: 'El formato del Flow ID es: wf_...',
      example: 'wf_693fe5c1201881908439fa2bef45084105cce21dc273ceef',
    },
    note: 'Si el workflow no existe, necesitas crearlo primero en la plataforma de OpenAI.',
  });
}

