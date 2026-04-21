# Monolith FullCycle - Módulo de Invoice

## Visão Geral

O módulo de Invoice é responsável pela geração e consulta de notas fiscais dentro do monólito. Suas funcionalidades são expostas exclusivamente através do padrão **Facade**, seguindo uma arquitetura limpa com as camadas de Domain, Use Cases, Repository e Factory.

## Estrutura do Módulo

```
src/modules/invoice/
├── domain/
│   ├── invoice.entity.ts          # Aggregate root Invoice
│   └── invoice-item.entity.ts     # Entidade InvoiceItem
├── facade/
│   ├── invoice.facade.interface.ts # DTOs e interface da Facade
│   ├── invoice.facade.ts           # Implementação da Facade
│   └── invoice.facade.spec.ts      # Testes de integração da Facade
├── factory/
│   └── invoice.facade.factory.ts   # Fábrica da Facade
├── gateway/
│   └── invoice.gateway.ts          # Interface do repositório
├── repository/
│   ├── invoice.model.ts            # Model Sequelize de Invoice
│   ├── invoice-item.model.ts       # Model Sequelize de InvoiceItem
│   ├── invoice.repository.ts       # Implementação do repositório
│   └── invoice.repository.spec.ts  # Testes de integração do repositório
└── usecase/
    ├── find-invoice/
    │   ├── find-invoice.dto.ts
    │   ├── find-invoice.usecase.ts
    │   └── find-invoice.usecase.spec.ts   # Teste unitário
    └── generate-invoice/
        ├── generate-invoice.dto.ts
        ├── generate-invoice.usecase.ts
        └── generate-invoice.usecase.spec.ts # Teste unitário
```

## Pré-requisitos

```bash
npm install
```

## Executando os Testes

### Todos os testes do módulo de invoice

```bash
npx jest --testPathPattern='invoice'
```

### Somente testes unitários dos Use Cases

```bash
# GenerateInvoiceUseCase
npx jest --testPathPattern='generate-invoice.usecase.spec'

# FindInvoiceUseCase
npx jest --testPathPattern='find-invoice.usecase.spec'
```

### Testes de integração da Facade

```bash
npx jest --testPathPattern='invoice.facade.spec'
```

### Testes de integração do Repository

```bash
npx jest --testPathPattern='invoice.repository.spec'
```

### Executar com saída detalhada

```bash
npx jest --testPathPattern='invoice' --verbose
```

## Detalhes dos Testes

### Testes Unitários dos Use Cases

Os testes de use case utilizam **repositórios mockados** para isolar a lógica de negócio da persistência.

**GenerateInvoiceUseCase** (`generate-invoice.usecase.spec.ts`):

- Valida que a invoice é criada com `name`, `document`, campos de endereço e `items` corretos.
- Verifica que o `total` é calculado como a soma dos preços dos itens.
- Confirma que o método `generate` do repositório é chamado.

**FindInvoiceUseCase** (`find-invoice.usecase.spec.ts`):

- Retorna uma invoice pelo `id` com todos os campos mapeados corretamente, incluindo `address` e `items` aninhados.
- Verifica o cálculo do `total` e a presença do `createdAt`.
- Confirma que o método `find` do repositório é chamado com o id correto.

### Testes de Integração da Facade

Os testes da facade utilizam um banco **SQLite em memória** via Sequelize, exercitando todo o fluxo (Facade → UseCase → Repository → BD).

**`invoice.facade.spec.ts`**:

- **generate**: Cria uma invoice através da facade e valida todos os campos de saída, incluindo o `total` calculado.
- **find**: Gera uma invoice e a recupera pelo id. Valida que a estrutura de saída corresponde ao `FindInvoiceFacadeOutputDTO` (com objeto `address` aninhado).

### Testes de Integração do Repository

**`invoice.repository.spec.ts`**:

- **generate**: Persiste uma invoice com itens e verifica os dados no banco.
- **find**: Persiste e recupera uma invoice, verificando a reconstrução da entidade de domínio.
- **not found**: Verifica que um erro é lançado para um id de invoice inexistente.

## Utilizando a Facade

Outros módulos interagem com o módulo de Invoice exclusivamente através da facade:

```typescript
import InvoiceFacadeFactory from "./modules/invoice/factory/invoice.facade.factory";

const facade = InvoiceFacadeFactory.create();

// Gerar uma invoice
const invoice = await facade.generate({
	name: "John Doe",
	document: "123.456.789-00",
	street: "Rua das Flores",
	number: "100",
	complement: "Apto 1",
	city: "São Paulo",
	state: "SP",
	zipCode: "01310-100",
	items: [
		{ id: "item-1", name: "Item A", price: 50 },
		{ id: "item-2", name: "Item B", price: 70 },
	],
});

// Buscar uma invoice
const found = await facade.find({ id: invoice.id });
```
