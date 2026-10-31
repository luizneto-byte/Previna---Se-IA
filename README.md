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


## Correção de build (31/10/2026)
As rotas autenticadas em `app/(platform)/layout.tsx` são renderizadas dinamicamente para evitar prerenderização da rota `/admin` sem sessão. A função `mustAuth` redireciona usuários sem sessão para `/login` em vez de lançar erro na geração das páginas.

## Integração de documentos normativos importados (atualização)

- Nova rota: `/pesquisa-nrs` (consulta direta a documentos do Neon, inclusive pendentes, com aviso de revisão).
- Chat ISA: pesquisa `nr_sources` e documentos em `nr_documentos_pendentes` **somente** quando `status='aprovado'`. O conteúdo não revisado não é enviado ao modelo como fonte normativa.
- Uma aprovação administrativa deve ocorrer **apenas após** comparar texto, anexos, revisão e vigência com a fonte oficial. Alterar o campo `status` diretamente **não prova** vigência.
- A busca em documentos integrais fornece prévias e **não extrai itens normativos validados**. O item citado deve ser comprovado nos documentos oficiais; a próxima melhoria é a divisão assistida e revisão por item.
- A opção `GEMINI_FALLBACK_MODEL` é opcional e habilita modelo alternativo em erros de capacidade, se suportado pela sua API key. O modelo principal permanece em `GEMINI_MODEL`.
- Nenhuma migração adicional é necessária **se** as tabelas `nr_sources` e `nr_documentos_pendentes` foram criadas anteriormente no mesmo banco de `DATABASE_URL`.

Consulta de conferência no Neon:

```sql
SELECT status, COUNT(*) AS documentos
FROM public.nr_documentos_pendentes
GROUP BY status ORDER BY status;
```

Ao publicar, preserve a pasta `.github/workflows` e `data/` existente no repositório, se você já tiver adicionado o importador via GitHub Actions. Este ZIP base pode não incluir os arquivos do importador do seu repositório.
