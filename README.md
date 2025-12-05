# Explorador de Locais - Mapbox Routes

Aplicação fullstack desenvolvida com Next.js 16 e Mapbox para visualizar locais e traçar rotas.

## 🚀 Tecnologias

### Frontend
- **Next.js 16.0.6** (App Router)
- **React 19.2.0**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Mapbox GL 3.16.0**
- **Framer Motion 12.23** (Animações)

### Backend
- **NestJS** (API separada)
- **DDD Architecture**
- **PostgreSQL** ou **SQLite**

## 📋 Pré-requisitos

- Node.js 20+
- pnpm (ou npm/yarn)
- Backend NestJS rodando em `http://localhost:3000`
- Token do Mapbox ([obter aqui](https://account.mapbox.com/access-tokens/))

## 🔧 Configuração

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Mapbox Access Token
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=seu_token_aqui
```

### 3. Rodar o projeto

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Rodar produção
pnpm start
```

A aplicação estará disponível em `http://localhost:3001` (ou outra porta se 3000 estiver ocupada).

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz (Server Component)
│   ├── page.tsx                 # Página principal
│   └── globals.css              # Estilos globais
├── components/
│   └── client/                  # Client Components
│       ├── LocationsView.tsx    # View principal
│       ├── LocationCard.tsx     # Card de local
│       ├── Map.tsx              # Mapa Mapbox
│       └── RouteButton.tsx      # Botão de rota
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
    ├── api.ts                   # API client
    └── mapbox.ts                # Mapbox config
```

## 🎯 Funcionalidades

### ✅ Implementadas

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

4. **Animações (Framer Motion)**
   - Animação de entrada dos cards
   - Hover effects nos cards
   - Transições suaves entre estados
   - Feedback visual para ações do usuário

5. **Tratamento de Erros**
   - Erro de conexão com API
   - Erro de geolocalização (permissão negada, timeout, etc.)
   - Feedback visual claro para o usuário

## 🏗️ Arquitetura

### Server vs Client Components

**Server Components:**
- `page.tsx` - Página principal (apenas renderiza o Client Component)

**Client Components** (marcados com `'use client'`):
- `LocationsView.tsx` - Gerencia estado e lógica principal
- `Map.tsx` - Integração com Mapbox (requer browser APIs)
- `LocationCard.tsx` - Interatividade com onClick
- `RouteButton.tsx` - Botão com interações

### Padrões Utilizados

1. **Service Layer**: Todas as chamadas de API isoladas em `services/`
2. **Custom Hooks**: Lógica reutilizável em hooks customizados
3. **TypeScript**: Tipagem forte em toda a aplicação
4. **Error Handling**: Tratamento centralizado de erros
5. **Clean Code**: Código legível e bem organizado

## 🔌 Integração com Backend

A aplicação consome a API NestJS documentada em [API.md](./API.md).

### Endpoints utilizados:

- `GET /locais` - Lista todos os locais
- `GET /locais/:id` - Busca local por ID (futuro)
- `POST /locais` - Cria novo local (futuro)
- `PATCH /locais/:id` - Atualiza local (futuro)
- `DELETE /locais/:id` - Deleta local (futuro)

## 🎨 Design

- **Dark Mode**: Suporte completo via Tailwind
- **Responsivo**: Mobile-first design
- **Acessível**: Uso de cores contrastantes e feedback visual
- **Moderno**: UI clean e intuitiva

## 🚀 Deploy

### Frontend (Vercel)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
3. Deploy automático

### Backend (Render.com)

Consulte a documentação do backend NestJS.

## 📝 Próximos Passos

- [ ] Implementar CRUD completo de locais
- [ ] Adicionar filtros e busca
- [ ] Implementar Server Actions para mutations
- [ ] Adicionar testes unitários
- [ ] Adicionar testes E2E
- [ ] Melhorar animações 3D no mapa
- [ ] Adicionar histórico de rotas
- [ ] Implementar favoritos

## 👨‍💻 Desenvolvimento

Este projeto demonstra:

- ✅ Domínio de Next.js App Router
- ✅ Separação correta de Server/Client Components
- ✅ Integração com APIs externas (Mapbox)
- ✅ Gerenciamento de estado
- ✅ Hooks customizados
- ✅ Animações com Framer Motion
- ✅ TypeScript avançado
- ✅ Clean Code e arquitetura limpa

## 📄 Licença

MIT

## 🤝 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
