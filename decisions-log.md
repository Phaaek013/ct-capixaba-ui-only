# decisions-log

## 2025-12-09
- Chat do aluno força `router.refresh()` somente quando o carregamento inicial/atualização assíncrona marca mensagens de coach/admin como lidas, garantindo que o sininho zere sem refazer toda a árvore em outros cenários.
