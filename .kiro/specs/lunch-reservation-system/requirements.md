# Documento de Requisitos - Sistema de Reservas de Almoço

## Introdução

O Sistema de Reservas de Almoço é uma aplicação corporativa que permite aos funcionários da empresa reservar suas refeições diárias. O sistema gerencia cardápios semanais, controla diferentes tipos de usuários e suas permissões, e facilita o processo de reserva com regras específicas de horário e disponibilidade.

## Glossário

- **Sistema_Reservas**: O sistema de reservas de almoço corporativo
- **Usuario_Admin**: Usuário com privilégios administrativos completos
- **Usuario_Fixo**: Usuário com agendamento automático diário de almoço
- **Usuario_Nao_Fixo**: Usuário que deve fazer reservas manuais quando desejar almoçar
- **Cardapio_Diario**: Menu disponível para um dia específico com suas variações
- **Reserva_Almoco**: Agendamento de refeição feito por um usuário para uma data específica
- **Horario_Limite**: 8:30 AM do dia da refeição, após o qual não são permitidas alterações
- **Variacao_Proteina**: Opção alternativa no cardápio substituindo a proteína principal por ovo

## Requisitos

### Requisito 1

**História do Usuário:** Como funcionário da empresa, quero fazer login no sistema usando meu CPF e senha, para que eu possa acessar as funcionalidades de reserva de almoço.

#### Critérios de Aceitação

1. WHEN um usuário inserir CPF e senha válidos, THE Sistema_Reservas SHALL autenticar o usuário e conceder acesso ao sistema
2. IF um usuário inserir credenciais inválidas, THEN THE Sistema_Reservas SHALL exibir mensagem de erro e negar o acesso
3. THE Sistema_Reservas SHALL validar o formato do CPF antes de processar a autenticação
4. THE Sistema_Reservas SHALL manter a sessão do usuário ativa durante o uso da aplicação

### Requisito 2

**História do Usuário:** Como administrador, quero gerenciar diferentes tipos de usuários (ADMIN, Usuario_Fixo, Usuario_Nao_Fixo), para que eu possa controlar o acesso e comportamento de cada funcionário no sistema.

#### Critérios de Aceitação

1. THE Sistema_Reservas SHALL suportar três tipos de usuário: ADMIN, Usuario_Fixo e Usuario_Nao_Fixo
2. WHEN um Usuario_Admin criar um novo usuário, THE Sistema_Reservas SHALL permitir definir o tipo de usuário
3. THE Sistema_Reservas SHALL permitir ao Usuario_Admin alterar o status de usuários entre ativo e inativo
4. THE Sistema_Reservas SHALL permitir ao Usuario_Admin editar informações de usuários existentes
5. THE Sistema_Reservas SHALL aplicar automaticamente agendamento diário para Usuario_Fixo

### Requisito 3

**História do Usuário:** Como administrador, quero gerenciar cardápios semanais de segunda a sexta-feira, para que eu possa definir as opções de refeição disponíveis para os funcionários.

#### Critérios de Aceitação

1. THE Sistema_Reservas SHALL permitir ao Usuario_Admin criar cardápios para dias úteis da semana
2. THE Sistema_Reservas SHALL incluir nos cardápios os componentes: salada, sobremesa, massa, molho, arroz, feijão e proteína
3. THE Sistema_Reservas SHALL permitir ao Usuario_Admin editar cardápios existentes
4. THE Sistema_Reservas SHALL criar automaticamente duas variações para cada Cardapio_Diario
5. WHERE uma Variacao_Proteina for selecionada, THE Sistema_Reservas SHALL substituir a proteína principal por ovo

### Requisito 4

**História do Usuário:** Como funcionário, quero fazer reservas de almoço selecionando o cardápio de um dia específico, para que eu possa garantir minha refeição.

#### Critérios de Aceitação

1. THE Sistema_Reservas SHALL exibir cardápios disponíveis para datas futuras
2. WHEN um usuário selecionar um Cardapio_Diario, THE Sistema_Reservas SHALL permitir escolher entre as duas variações disponíveis
3. THE Sistema_Reservas SHALL criar uma Reserva_Almoco quando o usuário confirmar a seleção
4. IF a data selecionada for no passado, THEN THE Sistema_Reservas SHALL impedir a criação da reserva
5. THE Sistema_Reservas SHALL confirmar a reserva ao usuário após criação bem-sucedida

### Requisito 5

**História do Usuário:** Como funcionário, quero alterar ou cancelar minhas reservas até às 8:30 AM do dia da refeição, para que eu possa ajustar meus planos conforme necessário.

#### Critérios de Aceitação

1. WHILE o horário atual for anterior ao Horario_Limite, THE Sistema_Reservas SHALL permitir alteração de reservas
2. WHILE o horário atual for anterior ao Horario_Limite, THE Sistema_Reservas SHALL permitir cancelamento de reservas
3. WHEN o Horario_Limite for ultrapassado, THE Sistema_Reservas SHALL bloquear alterações e cancelamentos
4. THE Sistema_Reservas SHALL exibir o Horario_Limite para o usuário ao visualizar reservas
5. THE Sistema_Reservas SHALL notificar o usuário sobre restrições de horário ao tentar modificar reservas expiradas

### Requisito 6

**História do Usuário:** Como usuário fixo, quero ter agendamentos automáticos diários, para que eu não precise fazer reservas manuais todos os dias.

#### Critérios de Aceitação

1. THE Sistema_Reservas SHALL criar automaticamente reservas diárias para Usuario_Fixo
2. THE Sistema_Reservas SHALL aplicar a variação padrão do cardápio para agendamentos automáticos
3. WHILE o usuário for do tipo Usuario_Fixo, THE Sistema_Reservas SHALL manter agendamentos automáticos ativos
4. THE Sistema_Reservas SHALL permitir ao Usuario_Fixo alterar a variação do cardápio em reservas automáticas
5. WHEN um Usuario_Fixo for alterado para Usuario_Nao_Fixo, THE Sistema_Reservas SHALL interromper agendamentos automáticos futuros
