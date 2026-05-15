# Monolith FullCycle - API REST

## Visão Geral

Monólito em TypeScript seguindo **Clean Architecture**. Todos os módulos de domínio (product-adm, client-adm, store-catalog, payment, invoice) expõem suas funcionalidades através de **Facades**. A camada de API (Express) orquestra essas facades para disponibilizar endpoints HTTP, incluindo o fluxo completo de compra via módulo de **Checkout**.

---

## Módulos

| Módulo | Responsabilidade |
|---|---|
| `product-adm` | Cadastro e controle de estoque de produtos |
| `store-catalog` | Catálogo de produtos com preço de venda |
| `client-adm` | Cadastro e busca de clientes |
| `payment` | Processamento de transações (aprova se valor ≥ 100) |
| `invoice` | Geração e consulta de notas fiscais |
| `checkout` | Orquestra todo o fluxo de compra |

---

## Endpoints da API

### `POST /products` — Cadastro de produto

```http
POST /products
Content-Type: application/json

{
  "name": "Notebook",
  "description": "Notebook 16GB RAM",
  "purchasePrice": 3500,
  "stock": 20
}
```

**Resposta** `201 Created`:
```json
{
  "id": "uuid",
  "name": "Notebook",
  "description": "Notebook 16GB RAM",
  "purchasePrice": 3500,
  "stock": 20,
  "createdAt": "2026-05-15T00:00:00.000Z",
  "updatedAt": "2026-05-15T00:00:00.000Z"
}
```

---

### `POST /clients` — Cadastro de cliente

```http
POST /clients
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "document": "123.456.789-00",
  "address": {
    "street": "Rua das Flores",
    "number": "100",
    "complement": "Apto 1",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  }
}
```

**Resposta** `201 Created`:
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "document": "123.456.789-00"
}
```

---

### `POST /checkout` — Realização de compra

Orquestra o fluxo completo: valida cliente, verifica estoque, processa pagamento e, se aprovado, gera nota fiscal.

> **Atenção:** o pagamento é aprovado automaticamente quando o valor total é ≥ 100.

```http
POST /checkout
Content-Type: application/json

{
  "clientId": "uuid-do-cliente",
  "products": [
    { "productId": "uuid-do-produto" }
  ]
}
```

**Resposta** `200 OK`:
```json
{
  "id": "uuid-do-pedido",
  "invoiceId": "uuid-da-nota-fiscal",
  "status": "approved",
  "total": 3500,
  "products": [
    { "productId": "uuid-do-produto" }
  ]
}
```

| Campo | Descrição |
|---|---|
| `status` | `"approved"` ou `"declined"` |
| `invoiceId` | Preenchido apenas quando `status = "approved"` |

---

### `GET /invoice/:id` — Consulta de nota fiscal

```http
GET /invoice/uuid-da-nota-fiscal
```

**Resposta** `200 OK`:
```json
{
  "id": "uuid-da-nota-fiscal",
  "name": "João Silva",
  "document": "123.456.789-00",
  "address": {
    "street": "Rua das Flores",
    "number": "100",
    "complement": "Apto 1",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  },
  "items": [
    { "id": "uuid-do-produto", "name": "Notebook", "price": 3500 }
  ],
  "total": 3500,
  "createdAt": "2026-05-15T00:00:00.000Z"
}
```

---

## Fluxo de Compra (Checkout)

```
POST /checkout
    │
    ├── ClientAdmFacade.find()          → valida que o cliente existe
    ├── ProductAdmFacade.checkStock()   → verifica estoque de cada produto
    ├── StoreCatalogFacade.find()       → obtém preço de venda de cada produto
    ├── [cria Order com total calculado]
    ├── PaymentFacade.process()         → processa o pagamento
    │       ├── status = "approved"  → InvoiceFacade.generate() → gera nota fiscal
    │       └── status = "declined" → pedido recusado, sem nota fiscal
    └── OrderRepository.placeOrder()   → persiste o pedido
```

---

## Pré-requisitos e Instalação

```bash
npm install
```

---

## Executando os Testes

### Todos os testes (unitários + E2E)

```bash
npm test
```

O comando executa primeiro a verificação de tipos com `tsc --noEmit` e depois toda a suíte Jest.

### Apenas os testes E2E da API

```bash
npx jest --testPathPattern='infrastructure/api'
```

### Apenas um endpoint específico

```bash
# Checkout
npx jest --testPathPattern='checkout.e2e'

# Invoice
npx jest --testPathPattern='invoice.e2e'

# Produtos
npx jest --testPathPattern='products.e2e'

# Clientes
npx jest --testPathPattern='clients.e2e'
```

### Apenas testes unitários de um módulo

```bash
# Todos os testes do módulo de invoice
npx jest --testPathPattern='modules/invoice'

# Use cases de checkout
npx jest --testPathPattern='place-order'
```

### Com saída detalhada

```bash
npm test -- --verbose
```

---

## Detalhes dos Testes E2E

Todos os testes E2E utilizam **Supertest** com um banco **SQLite em memória**, garantindo isolamento total entre os testes. Cada suíte cria e destrói sua própria instância do banco no `beforeEach`/`afterEach`.

| Arquivo | Endpoint | Validações |
|---|---|---|
| `products.e2e.spec.ts` | `POST /products` | Status 201, campos `id`, `name`, `purchasePrice`, `stock` |
| `clients.e2e.spec.ts` | `POST /clients` | Status 201, campos `id`, `name`, `email`, `document` |
| `invoice.e2e.spec.ts` | `GET /invoice/:id` | Status 200, campos `id`, `name`, `total`, `items`, `address` |
| `checkout.e2e.spec.ts` | `POST /checkout` + `GET /invoice/:id` | Status 200, `status = "approved"`, `invoiceId` preenchido, consulta da nota gerada |

---

## Estrutura de Diretórios

```
src/
├── modules/
│   ├── @shared/          # Entidades base, Value Objects (Id, Address)
│   ├── product-adm/      # Cadastro de produtos
│   ├── store-catalog/    # Catálogo com preço de venda
│   ├── client-adm/       # Cadastro de clientes
│   ├── payment/          # Processamento de pagamentos
│   ├── invoice/          # Geração de notas fiscais
│   └── checkout/         # Orquestração do fluxo de compra
│       ├── domain/
│       ├── gateway/
│       ├── repository/
│       ├── usecase/place-order/
│       ├── facade/
│       └── factory/
└── infrastructure/
    └── api/
        ├── express.ts            # Factory do app Express
        ├── routes/               # Handlers de cada endpoint
        └── __tests__/            # Testes E2E com Supertest
```

---

## Utilizando a Facade do Checkout em outros módulos

```typescript
import CheckoutFacadeFactory from "./modules/checkout/factory/checkout.facade.factory";

const facade = CheckoutFacadeFactory.create();

const order = await facade.placeOrder({
  clientId: "uuid-do-cliente",
  products: [
    { productId: "uuid-produto-1" },
    { productId: "uuid-produto-2" },
  ],
});

console.log(order.status);    // "approved" ou "declined"
console.log(order.invoiceId); // uuid da nota fiscal, se aprovado
console.log(order.total);     // soma dos preços de venda
```
