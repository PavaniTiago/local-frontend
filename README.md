# Explorador de Locais - Mapbox Routes

Aplicação web fullstack desenvolvida com Next.js 16 e Mapbox para visualização de locais geográficos e cálculo de rotas. O projeto demonstra integração com APIs externas, gerenciamento de estado, e arquitetura escalável baseada em features.

## Tecnologias

### Frontend
- **Next.js 16.0.6** (App Router)
- **React 19.2.0**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Mapbox GL 3.16.0**
- **Framer Motion 12.23** (Animações)
- **Sonner** (Notificações toast)

### Backend
- **NestJS** (API separada)
- **DDD Architecture**
- **PostgreSQL** ou **SQLite**

## Pré-requisitos

- Node.js 20 ou superior
- pnpm (ou npm/yarn)
- Backend NestJS rodando em `http://localhost:3000`
- Token do Mapbox ([obter aqui](https://account.mapbox.com/access-tokens/))

## Como Executar

### 1. Instalação de Dependências

```bash
pnpm install
```

### 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Mapbox Access Token
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=seu_token_aqui
```

### 3. Executar o Projeto

```bash
# Modo desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar build de produção
pnpm start
```

A aplicação estará disponível em `http://localhost:3001` (ou outra porta se 3000 estiver ocupada).

## Funcionalidades

### Implementadas

1. **Visualização de Locais**
   - Lista de locais cadastrados no backend
   - Cards interativos com imagem, nome e descrição
   - Seleção de local com feedback visual

2. **Mapa Interativo (Mapbox)**
   - Visualização de todos os locais no mapa
   - Marcadores customizados para cada local
   - Controles de navegação (zoom, pan)
   - Popups com informações ao clicar nos marcadores

3. **Traçar Rotas**
   - Solicitação de geolocalização do usuário
   - Cálculo de rota usando Mapbox Directions API
   - Visualização da rota no mapa
   - Informações de distância e duração
   - Marcador de localização atual

4. **CRUD de Locais**
   - Criar novos locais
   - Editar locais existentes
   - Excluir locais com confirmação

5. **Animações (Framer Motion)**
   - Animação de entrada dos cards
   - Hover effects nos cards
   - Transições suaves entre estados
   - Feedback visual para ações do usuário

6. **Tratamento de Erros**
   - Erro de conexão com API
   - Erro de geolocalização (permissão negada, timeout, etc.)
   - Feedback visual claro para o usuário

## Arquitetura

### Estrutura de Diretórios

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz (Server Component)
│   ├── page.tsx                 # Página principal (Server Component)
│   └── globals.css              # Estilos globais
├── components/
│   └── client/                  # Client Components
│       ├── LocationsView.tsx    # View principal (orquestrador)
│       ├── LocationCard.tsx     # Card de local
│       ├── Map.tsx              # Mapa Mapbox
│       ├── RouteButton.tsx      # Botão de rota
│       ├── LocationFormModal.tsx # Modal de formulário
│       └── RouteParticles.tsx   # Efeitos de partículas
├── features/
│   └── locations/
│       ├── types/               # TypeScript types
│       │   └── location.ts
│       ├── services/            # API services
│       │   └── locationService.ts
│       └── hooks/               # Custom hooks
│           ├── useLocations.ts
│           └── useGeolocation.ts
└── lib/
    ├── api.ts                   # API client centralizado
    └── mapbox.ts                # Configuração Mapbox
```

### Decisões Arquiteturais

#### 1. Feature-Based Architecture

O projeto utiliza uma arquitetura baseada em features, onde cada domínio (como `locations`) possui sua própria estrutura completa:

- **types/**: Definições TypeScript específicas do domínio
- **services/**: Lógica de comunicação com a API
- **hooks/**: Lógica de estado e efeitos colaterais reutilizáveis

**Benefícios:**
- Organização clara e escalável
- Facilita manutenção e evolução
- Reduz acoplamento entre features
- Permite trabalhar em features isoladamente

#### 2. Separação Server/Client Components

**Server Components:**
- `app/layout.tsx`: Layout raiz que não requer interatividade
- `app/page.tsx`: Página principal que apenas renderiza o Client Component

**Client Components:**
- Todos os componentes em `components/client/` são marcados com `'use client'`
- Componentes que requerem interatividade, hooks, ou APIs do browser

**Benefícios:**
- Reduz JavaScript enviado ao cliente
- Melhora performance inicial
- Aproveita renderização no servidor quando possível
- Mantém interatividade apenas onde necessário

#### 3. Service Layer Pattern

Todas as chamadas de API são centralizadas em services dentro de cada feature:

```typescript
// features/locations/services/locationService.ts
export async function getLocations(): Promise<Location[]>
export async function createLocation(data: CreateLocationDto): Promise<Location>
```

**Benefícios:**
- Separação de responsabilidades
- Facilita testes unitários
- Centraliza lógica de comunicação com backend
- Permite fácil substituição da implementação

#### 4. Custom Hooks para Lógica de Estado

Lógica de estado e efeitos colaterais são encapsulados em hooks customizados:

- `useLocations`: Gerencia estado de lista de locais, loading, erros
- `useGeolocation`: Gerencia geolocalização do usuário

**Benefícios:**
- Reutilização de lógica
- Componentes mais limpos e focados em apresentação
- Facilita testes
- Encapsula complexidade

#### 5. API Client Centralizado

O arquivo `lib/api.ts` fornece um cliente HTTP centralizado com tratamento de erros padronizado:

**Benefícios:**
- Configuração única de URL base
- Tratamento consistente de erros
- Headers padronizados
- Facilita interceptors futuros (auth, logging)

#### 6. TypeScript Strict

Todo o projeto utiliza TypeScript com tipagem forte:

**Benefícios:**
- Detecção de erros em tempo de desenvolvimento
- Melhor autocomplete e IntelliSense
- Documentação implícita através de tipos
- Refatoração mais segura

#### 7. Componentes de Apresentação vs Container

- **Container Components** (`LocationsView`): Gerencia estado e lógica de negócio
- **Presentation Components** (`LocationCard`, `Map`): Recebem props e focam em apresentação

**Benefícios:**
- Componentes mais testáveis
- Reutilização facilitada
- Separação clara de responsabilidades

### Padrões Utilizados

1. **Error Handling**: Tratamento centralizado de erros com classes customizadas (`ApiClientError`)
2. **Loading States**: Estados de loading separados para diferentes operações (initial load vs refetch)
3. **Optimistic Updates**: Feedback imediato ao usuário com atualização posterior
4. **Toast Notifications**: Feedback não intrusivo para ações do usuário
5. **Modal Pattern**: Modais controlados para formulários e confirmações
6. **Controlled Components**: Formulários e inputs controlados via React state

## Integração com Backend

A aplicação consome a API NestJS que deve estar rodando em `http://localhost:3000` (configurável via `NEXT_PUBLIC_API_URL`).

### Endpoints Utilizados

- `GET /locais` - Lista todos os locais
- `GET /locais/:id` - Busca local por ID
- `POST /locais` - Cria novo local
- `PATCH /locais/:locais/:id` - Atualiza local
- `DELETE /locais/:id` - Deleta local

### Tratamento de Erros

O cliente API trata automaticamente:
- Erros HTTP (4xx, 5xx)
- Erros de conexão
- Timeouts
- Respostas vazias (204)

## Design e UX

- **Dark Mode**: Suporte completo via Tailwind CSS com classes condicionais
- **Responsivo**: Design mobile-first com breakpoints do Tailwind
- **Acessibilidade**: Uso de cores contrastantes, feedback visual claro, e navegação por teclado
- **Performance**: Lazy loading de componentes, otimização de imagens, e code splitting automático do Next.js

## Deploy

### Frontend (Vercel)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
3. Deploy automático a cada push

### Backend

Consulte a documentação do backend NestJS para instruções de deploy.

## Próximos Passos

- [ ] Implementar filtros e busca de locais
- [ ] Adicionar Server Actions para mutations
- [ ] Implementar testes unitários (Jest/Vitest)
- [ ] Adicionar testes E2E (Playwright/Cypress)
- [ ] Melhorar animações 3D no mapa
- [ ] Adicionar histórico de rotas
- [ ] Implementar favoritos
- [ ] Adicionar cache de rotas
- [ ] Implementar offline support (PWA)

## Licença

MIT

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
