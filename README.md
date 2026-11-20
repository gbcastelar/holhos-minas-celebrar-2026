# H.Olhos Minas — Celebrar 2026

Convite digital com confirmação de presença, Supabase, WhatsApp e painel administrativo.

## Regras do piloto
- Cadastro público por link.
- Sem acompanhantes: cada resposta representa uma pessoa.
- Resposta: `yes` (confirmado) ou `no` (não participará).
- Não existe status "pendente" porque não há lista prévia de convidados.
- O WhatsApp abre com uma mensagem preenchida; o convidado precisa tocar em Enviar.

## 1. Configurar o Supabase
1. Crie um projeto no Supabase.
2. Abra SQL Editor e execute `supabase/schema.sql`.
3. Em Authentication > Users, crie o usuário administrador com e-mail e senha.
4. Copie Project URL e a chave publishable/anon do projeto.
5. Edite `js/config.js` e substitua `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
6. Não coloque a chave `service_role` no frontend.

## 2. Testar localmente
Abra `index.html` com um servidor local estático (por exemplo, Live Server no VS Code). Para o painel, acesse `admin.html`.

## 3. Publicar no GitHub Pages
1. Crie um repositório GitHub, por exemplo `holhos-minas-celebrar-2026`.
2. Envie todos os arquivos e pastas deste projeto para a raiz do repositório.
3. Em Settings > Pages, escolha Deploy from a branch.
4. Selecione `main` e `/ (root)`, salve.
5. Aguarde a publicação e teste o endereço público.

## 4. Ajustes quando a organização definir o evento
Edite `js/config.js`:
- `EVENT_DATE_LABEL`: data e horário que serão exibidos.
- `MAPS_URL`: link do Google Maps para o endereço definitivo.
- `WHATSAPP_NUMBER`: número oficial com código do país, somente dígitos.

Atualize também os textos de data, local e horário em `index.html` quando necessário.

## 5. Painel e relatórios
Acesse `admin.html`, entre com o usuário administrador do Supabase.
- CSV: abre no Excel/LibreOffice.
- Salvar PDF / Imprimir: use a opção "Salvar como PDF" do navegador.
- Os totais de pessoas confirmadas são iguais ao número de confirmações positivas, pois acompanhantes não são permitidos.

## Segurança e privacidade
- A tabela tem RLS habilitado.
- Visitantes podem inserir respostas, mas não podem ler a lista.
- Apenas usuários autenticados podem consultar os registros.
- Não compartilhe a senha administrativa.
- A chave pública/anon só é segura com as políticas RLS ativas.
- O formulário coleta nome e WhatsApp para a finalidade indicada no consentimento. Defina com a empresa um prazo para retenção/exclusão dos dados após o evento.

## Observações
- O endereço de Alfenas no mapa é apenas referência de teste e deve ser substituído pelo local real da confraternização.
- O projeto não envia WhatsApp automaticamente: ele abre uma conversa com texto pré-preenchido.
- O painel ainda não tem edição/exclusão de registros. Essas funções podem ser adicionadas com regras administrativas específicas.
