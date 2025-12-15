# Implementation Plan

- [x] 1. Adicionar logs de investigação no fluxo de atualização
  - Adicionar console.log no início do método ReservationController.update para logar id e body da requisição
  - Adicionar console.log no ReservationService.update antes e depois de cada validação crítica
  - Adicionar try-catch com log detalhado no PrismaReservationRepository.update
  - _Requirements: 1.1, 4.1, 4.2_

- [x] 2. Corrigir validação de menu variations no ReservationService
  - Adicionar validação explícita para verificar se menu.variations existe e é um array
  - Adicionar validação para verificar se a variação pertence ao menu correto (comparar menuId)
  - Melhorar mensagens de erro para serem mais específicas sobre o problema
  - _Requirements: 2.1, 2.5, 3.4_

- [x] 3. Melhorar tratamento de erros no controller
  - Adicionar log do erro completo antes de retornar erro 500
  - Garantir que todos os tipos de erro sejam capturados (ZodError, AppError, PrismaError, Error genérico)
  - Adicionar tratamento específico para erros do Prisma (P2002, P2003, P2025)
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Adicionar validação de foreign key no repository
  - Verificar se menuVariationId existe na tabela menu_variations antes de atualizar
  - Adicionar query para validar que a variação pertence ao menu da reserva
  - Retornar erro específico se a validação falhar
  - _Requirements: 2.5, 3.4_

- [x] 5. Testar a correção com diferentes cenários
  - Testar atualização com variação válida do mesmo menu
  - Testar atualização com variação inválida (UUID que não existe)
  - Testar atualização com variação de outro menu
  - Testar atualização após prazo expirado
  - Verificar que o erro 500 não ocorre mais e erros apropriados são retornados
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Limpar logs temporários e adicionar logs permanentes
  - Remover console.log temporários de investigação
  - Adicionar logs permanentes em pontos críticos usando logger apropriado
  - Documentar a causa raiz do problema e a solução aplicada
  - _Requirements: 4.1, 4.2, 4.3_
