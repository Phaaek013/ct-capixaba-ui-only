const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

/**
 * Teste de Idempotência - Cenário 6.1
 * Simula múltiplos cliques em "concluir" pelo aluno
 */

const TREINO_ID = '14'; // Treino que já tem conclusão
const USUARIO_EMAIL = 'phaelteste@hotmail.com';

async function countConclusoes() {
  const count = await p.treinoConclusao.count({
    where: {
      treinoId: TREINO_ID,
      usuario: { email: USUARIO_EMAIL }
    }
  });
  return count;
}

async function countMensagens() {
  const conclusao = await p.treinoConclusao.findFirst({
    where: {
      treinoId: TREINO_ID,
      usuario: { email: USUARIO_EMAIL }
    },
    include: { mensagens: true }
  });
  return conclusao ? conclusao.mensagens.length : 0;
}

async function simularConcluirViaDb(feedbackText) {
  // Simula o que o endpoint faz - usando a mesma lógica
  const usuario = await p.usuario.findUnique({
    where: { email: USUARIO_EMAIL },
    select: { id: true }
  });

  const temTexto = feedbackText && feedbackText.trim().length > 0;

  // 1. Upsert da conclusão
  const conclusao = await p.treinoConclusao.upsert({
    where: {
      usuarioId_treinoId: {
        usuarioId: usuario.id,
        treinoId: TREINO_ID
      }
    },
    update: {
      feedbackText: temTexto ? feedbackText.trim() : null,
      dataConclusao: new Date()
    },
    create: {
      usuarioId: usuario.id,
      treinoId: TREINO_ID,
      feedbackText: temTexto ? feedbackText.trim() : null
    }
  });

  // 2. Se tem texto, verifica duplicata antes de criar mensagem
  if (temTexto) {
    const ultimaMensagem = await p.treinoMensagem.findFirst({
      where: {
        treinoConclusaoId: conclusao.id,
        autorId: usuario.id
      },
      orderBy: { criadoEm: 'desc' }
    });

    // Só cria se não for duplicata
    if (!ultimaMensagem || ultimaMensagem.texto !== feedbackText.trim()) {
      await p.treinoMensagem.create({
        data: {
          treinoConclusaoId: conclusao.id,
          autorId: usuario.id,
          texto: feedbackText.trim()
        }
      });
      console.log(`    -> Mensagem criada: "${feedbackText.trim().slice(0,30)}..."`);
    } else {
      console.log(`    -> Mensagem duplicada ignorada`);
    }
  }

  return conclusao;
}

async function main() {
  console.log('=== TESTE DE IDEMPOTÊNCIA - CENÁRIO 6.1 ===\n');
  
  const antes = {
    conclusoes: await countConclusoes(),
    mensagens: await countMensagens()
  };
  
  console.log(`ANTES: ${antes.conclusoes} conclusão(ões), ${antes.mensagens} mensagem(ns)\n`);
  
  // --- Teste 6.1.a: Clicar "concluir" várias vezes SEM texto ---
  console.log('--- 6.1.a: Concluir SEM texto (3x) ---');
  for (let i = 1; i <= 3; i++) {
    console.log(`  Tentativa ${i}...`);
    await simularConcluirViaDb('');
  }
  
  const apos_a = {
    conclusoes: await countConclusoes(),
    mensagens: await countMensagens()
  };
  console.log(`  APÓS 6.1.a: ${apos_a.conclusoes} conclusão(ões), ${apos_a.mensagens} mensagem(ns)\n`);
  
  // --- Teste 6.1.b: Clicar "concluir" várias vezes COM MESMO texto ---
  console.log('--- 6.1.b: Concluir COM MESMO texto (3x) ---');
  const textoFixo = 'Feedback repetido para teste';
  for (let i = 1; i <= 3; i++) {
    console.log(`  Tentativa ${i}...`);
    await simularConcluirViaDb(textoFixo);
  }
  
  const apos_b = {
    conclusoes: await countConclusoes(),
    mensagens: await countMensagens()
  };
  console.log(`  APÓS 6.1.b: ${apos_b.conclusoes} conclusão(ões), ${apos_b.mensagens} mensagem(ns)\n`);
  
  // --- Teste 6.1.c: Clicar "concluir" com NOVO texto (substitui) ---
  console.log('--- 6.1.c: Concluir COM NOVO texto (substitui feedback) ---');
  const textoNovo = 'Novo feedback substituindo o anterior';
  await simularConcluirViaDb(textoNovo);
  
  const apos_c = {
    conclusoes: await countConclusoes(),
    mensagens: await countMensagens()
  };
  console.log(`  APÓS 6.1.c: ${apos_c.conclusoes} conclusão(ões), ${apos_c.mensagens} mensagem(ns)\n`);
  
  // --- Resultado final ---
  console.log('=== RESULTADO FINAL ===');
  console.log(`Conclusões: ${antes.conclusoes} -> ${apos_c.conclusoes} (esperado: 1)`);
  console.log(`Mensagens: ${antes.mensagens} -> ${apos_c.mensagens}`);
  
  if (apos_c.conclusoes === 1) {
    console.log('\n✓ PASSOU: Apenas 1 TreinoConclusao (upsert funcionou)');
  } else {
    console.log('\n✗ FALHOU: Múltiplas TreinoConclusao criadas!');
  }
  
  // Verificar se não criou mensagens duplicadas
  const conclusaoFinal = await p.treinoConclusao.findFirst({
    where: {
      treinoId: TREINO_ID,
      usuario: { email: USUARIO_EMAIL }
    },
    include: {
      mensagens: {
        orderBy: { criadoEm: 'desc' },
        take: 10
      }
    }
  });
  
  // Contar mensagens com mesmo texto
  const textos = conclusaoFinal.mensagens.map(m => m.texto);
  const duplicatas = textos.filter((t, i) => textos.indexOf(t) !== i);
  
  if (duplicatas.length === 0) {
    console.log('✓ PASSOU: Nenhuma mensagem duplicada com mesmo texto');
  } else {
    console.log(`✗ FALHOU: ${duplicatas.length} mensagens duplicadas encontradas`);
  }
  
  await p.$disconnect();
}

main().catch(console.error);
