# ISA Voz — Previna-se

Projeto Next.js pronto para instalar e publicar na Vercel. Interface em português com chat, leitura das respostas, reconhecimento de fala e uma experiência de "ligação" **dentro do navegador**, sem discagem para número de telefone.

## Instalação

1. Extraia o ZIP e abra a pasta no Codespaces / VS Code.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha `GEMINI_API_KEY` (obtida no Google AI Studio) **ou** `ISA_API_URL` e `ISA_API_TOKEN` do seu backend já existente.
4. Configure `ADMIN_PASSWORD` (mínimo 12 caracteres) e `SESSION_SECRET` (mínimo 32 caracteres aleatórios).
5. Execute `npm run dev` e acesse http://localhost:3000.
6. Para Vercel, faça deploy desta pasta como projeto Next.js e cadastre as mesmas variáveis em Project Settings > Environment Variables.

O modelo padrão é `gemini-3.8-flash`. Se sua conta não tiver acesso, consulte a listagem de modelos do Google AI Studio e configure `GEMINI_MODEL` para um modelo disponível de geração de texto. A API pode ter limites, custos ou cotas, dependendo da conta.

## Modo Luiz e privacidade

Clique em **Sou o Luiz**, e informe a senha de administrador do servidor. O servidor cria um cookie de sessão assinado válido por 12 horas (HttpOnly). Só a sessão autenticada recebe as brincadeiras de "namorado"; qualquer visitante recebe personalidade divertida sem essa intimidade. O relacionamento é uma brincadeira ficcional de assistente virtual, sem alegar que uma IA tenha relacionamento humano real.

## Voz

- **Ligar para ISA** abre sessão de voz no **navegador**. Ela ouve uma frase, envia o texto à IA, fala a resposta e volta a ouvir após terminar.
- **Ouvir** reproduz respostas anteriores; botão **Voz** habilita ou desabilita a leitura.
- Usa Web Speech API do navegador. Depende da disponibilidade de reconhecimento de voz e de uma voz pt-BR instalada. Prefira Chrome/Edge com microfone permitido, em HTTPS (ou localhost). Pode não funcionar em alguns navegadores. Algumas plataformas enviam áudio para serviço de reconhecimento do navegador, sem processamento local.
- Não é uma ligação telefônica real, nem uma conexão full-duplex com interrupção/barge-in. Para isso é necessária integração separada com API de voz em tempo real e, para telefones, operadora de telefonia.

## Integração com sua ISA atual

Por padrão, usa Gemini texto e **não acessa automaticamente o banco de normas / Neon / RAG** da ISA que você já construiu. Para aproveitar exatamente as respostas do seu sistema, configure `ISA_API_URL` para uma API sua que aceite POST JSON `{messages, systemInstruction, isAdmin}` e retorne JSON `{reply:"..."}`. Use `ISA_API_TOKEN` para autenticação no backend. Confirme a compatibilidade com o seu endpoint, pois a API original não foi fornecida nesta conversa.

Este projeto é um pacote independente, não uma modificação verificada do seu repositório atual. Para juntar com o projeto existente sem quebrar rotas, será necessário integrar os arquivos e conferir a autenticação real.

## Cuidados antes de publicar

- Não exponha `GEMINI_API_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET` ou `ISA_API_TOKEN` no frontend.
- Proteja o endpoint público com rate limit e monitoramento de gastos antes de divulgar.
- A autenticação de senha do pacote é simples, própria para demonstração/uso controlado; para produção aberta, prefira autenticação central com rate limit para login.
- Nunca presuma conformidade de NR sem checar a fonte oficial.

Referências: https://ai.google.dev/api/generate-content e https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
