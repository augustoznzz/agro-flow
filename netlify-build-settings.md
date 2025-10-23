# Configurações de Build para Netlify

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel da Netlify (Site settings > Environment variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui
```

## Configurações de Build

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node.js version**: 20.9.0 (configurado no netlify.toml)

## Verificações

1. ✅ Node.js 20.9.0 configurado
2. ✅ Plugin @netlify/plugin-nextjs ativo
3. ✅ Build command correto
4. ✅ Publish directory correto

## Troubleshooting

Se ainda houver problemas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme que o repositório está conectado corretamente
3. Verifique os logs de build para erros específicos
4. Teste o build localmente com `npm run build`
