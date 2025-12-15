# Requirements Document

## Introduction

Este documento especifica os requisitos para um sistema de gerenciamento de dispositivos que permite cadastrar dispositivos e atualizar seus status em tempo real via WebSocket. O sistema deve seguir a arquitetura hexagonal existente no projeto e integrar-se com a estrutura de pastas atual.

## Glossary

- **Device_Management_System**: O sistema completo de gerenciamento de dispositivos
- **Device**: Entidade que representa um dispositivo físico com nome, MAC address e status
- **WebSocket_Service**: Serviço responsável pela comunicação em tempo real
- **Device_Repository**: Interface para persistência de dados dos dispositivos
- **MAC_Address**: Endereço físico único do dispositivo (Media Access Control)
- **Device_Status**: Estado atual do dispositivo (ATIVO ou INATIVO)

## Requirements

### Requirement 1

**User Story:** Como um administrador do sistema, eu quero cadastrar novos dispositivos, para que eu possa gerenciar todos os dispositivos da rede.

#### Acceptance Criteria

1. WHEN a POST request is made to /api/devices with valid data, THE Device_Management_System SHALL create a new device record
2. THE Device_Management_System SHALL validate that the name field is provided and not empty
3. THE Device_Management_System SHALL validate that the mac field is provided and not empty
4. THE Device_Management_System SHALL ensure that the mac address is unique across all devices
5. WHEN a device is successfully created, THE WebSocket_Service SHALL emit a 'device:created' event to all connected clients

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero visualizar todos os dispositivos cadastrados, para que eu possa ter uma visão geral do estado da rede.

#### Acceptance Criteria

1. WHEN a GET request is made to /api/devices, THE Device_Management_System SHALL return a list of all registered devices
2. THE Device_Management_System SHALL include device id, name, mac, status, and created_at in the response
3. THE Device_Management_System SHALL return devices ordered by creation date (newest first)

### Requirement 3

**User Story:** Como um administrador do sistema, eu quero alterar o status de um dispositivo, para que eu possa ativar ou desativar dispositivos conforme necessário.

#### Acceptance Criteria

1. WHEN a PATCH request is made to /api/devices/:id/status, THE Device_Management_System SHALL toggle the device status between ATIVO and INATIVO
2. IF the device does not exist, THEN THE Device_Management_System SHALL return a 404 error
3. WHEN a device status is successfully updated, THE WebSocket_Service SHALL emit a 'device:status' event to all connected clients
4. THE Device_Management_System SHALL include the updated device data in the WebSocket event

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero receber atualizações em tempo real sobre dispositivos, para que eu possa monitorar mudanças sem precisar recarregar a página.

#### Acceptance Criteria

1. THE WebSocket_Service SHALL maintain persistent connections with clients
2. WHEN a new device is created, THE WebSocket_Service SHALL broadcast the device data to all connected clients
3. WHEN a device status changes, THE WebSocket_Service SHALL broadcast the updated device data to all connected clients
4. THE WebSocket_Service SHALL handle client connections and disconnections gracefully

### Requirement 5

**User Story:** Como um desenvolvedor, eu quero que o sistema tenha testes adequados, para que eu possa garantir a qualidade e confiabilidade do código.

#### Acceptance Criteria

1. THE Device_Management_System SHALL have integration tests for all API endpoints
2. THE Device_Management_System SHALL have at least one unit test for core business logic
3. THE Device_Management_System SHALL validate test coverage for critical functionality
4. THE Device_Management_System SHALL ensure tests can run independently and consistently
