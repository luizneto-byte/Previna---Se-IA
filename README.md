# Previna-se IA — ISA

Plataforma independente de SST: cadastro/login com sessão segura (JWT em cookie httpOnly), Neon PostgreSQL, chat ISA com Gemini, biblioteca de NR-01 a NR-38, histórico e área administrativa para importar trechos normativos conferidos.

## Instalação
1. Instale Node.js 20+.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha `DATABASE_URL`, `AUTH_SECRET` (mín. 32 caracteres), `GEMINI_API_KEY` e `GEMINI_MODEL` compatível com sua conta.
4. No **SQL Editor do Neon**, execute todo o arquivo `db/schema.sql`.
5. Execute `npm run dev` e abra `http://localhost:3000`.
6. Faça seu cadastro. Para tornar o primeiro usuário administrador, no Neon execute `UPDATE users SET role='admin' WHERE email='SEU_EMAIL';` (substitua seu e-mail). **Faça isso apenas para conta confiável.**
7. Acesse `/admin` para importar trechos de NRs cuja redação e vigência você verificou.

## Deploy Vercel
Importe o repositório GitHub como projeto Next.js; configure as mesmas variáveis em **Production** e **Preview** conforme necessário; execute o SQL no Neon; faça redeploy após editar variáveis.

## O que funciona
- Cadastro, login e logout
- Controle de acesso por usuário, histórico isolado
- Chat com ISA por API Gemini se chave configurada
- Consulta a trechos verificados armazenados no Neon (busca textual em português)
- Catálogo pesquisável NR-01 a NR-38 e links para portal oficial
- Painel admin, estatísticas e inclusão de fontes
- Interface responsiva e avatar original ISA

## Limitações importantes
- **Não há textos integrais das 36 NRs vigentes pré-carregados**. A biblioteca contém índices e links oficiais; a fundamentação por item depende de importação e conferência dos trechos via `/admin`. Portanto, o MVP **não é um RAG completo** e não deve afirmar conformidade jurídica.
- NR-02 e NR-27 estão revogadas. Mudanças futuras de vigência precisam ser verificadas no MTE.
- Documentos automáticos Word/PDF, análise de foto, recuperação de senha por e-mail, quotas/rate limiting robustos e assinatura/gestão empresarial são melhorias futuras.
- Cadastro público está aberto no MVP; para produção comercial, é recomendado adicionar verificação de e-mail, antiabuso, proteção de rate-limit, LGPD e gestão de planos.
- A logomarca foi representada com marca tipográfica provisória; substitua por logo oficial no componente de navegação e página inicial quando tiver arquivo autorizado.

Fonte MTE: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs


## Atualização de identidade visual
A identidade da marca usa o símbolo enviado pelo proprietário em `public/logo-previna.png`, um favicon derivado em `app/icon.png` e a nova mascote em `public/isa.png`. A homepage, navegação e login foram atualizados. Para publicar, envie os arquivos ao repositório e faça novo deploy.
