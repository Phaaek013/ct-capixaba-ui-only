const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkBanco() {
  console.log('=== ESTADO DO BANCO ===\n');
  
  const conclusoes = await p.treinoConclusao.findMany({
    include: { 
      mensagens: true,
      usuario: { select: { email: true, id: true } }
    },
    orderBy: { id: 'desc' }
  });
  
  console.log('Total de TreinoConclusao:', conclusoes.length);
  
  // Agrupar por treino+aluno para verificar duplicatas
  const agrupado = {};
  
  for (const c of conclusoes) {
    const chave = `treino=${c.treinoId}_aluno=${c.usuarioId}`;
    if (!agrupado[chave]) agrupado[chave] = [];
    agrupado[chave].push(c);
    
    console.log(`\nConclusão #${c.id}: treino=${c.treinoId}, usuario=${c.usuario.email}`);
    console.log(`  feedbackText: ${c.feedbackText ? c.feedbackText.slice(0,50) : '(vazio)'}`);
    console.log(`  mensagens: ${c.mensagens.length}`);
    for (const m of c.mensagens) {
      console.log(`    - msg #${m.id}: "${m.texto.slice(0,40)}..."`);
    }
  }
  
  // Verificar duplicatas
  console.log('\n=== VERIFICAÇÃO DE DUPLICATAS ===');
  let temDuplicata = false;
  for (const [chave, lista] of Object.entries(agrupado)) {
    if (lista.length > 1) {
      temDuplicata = true;
      console.log(`DUPLICATA ENCONTRADA: ${chave} tem ${lista.length} registros!`);
    }
  }
  
  if (!temDuplicata) {
    console.log('✓ Nenhuma duplicata de TreinoConclusao encontrada');
  }
}

async function main() {
  await checkBanco();
  await p.$disconnect();
}

main().catch(console.error);
