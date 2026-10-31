# Voz na ISA original (sem substituir o projeto)

Este pacote preserva os arquivos do ZIP original e altera somente `components/Chat.tsx`, `lib/ai.ts` e `app/api/chat/route.ts`. Não use o ZIP separado ISA_Voz_PrevinaSe.zip.

## Recurso de chamada

Na página original `/chat`, clique em **Ligar para ISA**, permita o microfone, fale e aguarde a resposta em voz alta. A experiência usa APIs de fala do navegador; **não é uma chamada telefônica real**, e a disponibilidade, a naturalidade da voz e as risadas variam conforme o navegador/dispositivo. O botão de ouvir a resposta também está disponível. Em alguns navegadores, é necessário clicar em `Ouvir novamente`.

## Personalidade

A IA se apresenta como criada por Luiz Salgueiro, fica mais conversadeira e usa humor com cautela em temas de segurança. O tratamento de namorado em tom de brincadeira só é habilitado quando a sessão autenticada tem papel `admin` e nome que corresponde a `Luiz ... Salgueiro`.

## Instalação

Este ZIP é uma cópia completa da versão original enviada. Para preservar mudanças que você já tenha feito depois daquela versão, copie **apenas estes três arquivos alterados** para o repositório atual: `components/Chat.tsx`, `lib/ai.ts`, `app/api/chat/route.ts`. Faça backup dos arquivos atuais antes. Não substitua `package.json`, layout, estilos, rotas de login, ou configurações da Vercel.

Confira `npm install`, `npm run build`, e teste login, chat, histórico, admin e chamada antes de publicar. Permanecem necessárias as variáveis originais, como `DATABASE_URL`, `AUTH_SECRET` e `GEMINI_API_KEY`.
