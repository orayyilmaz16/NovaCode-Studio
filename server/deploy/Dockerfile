# NovaCode senkron sunucusu: yalnız çalışma zamanı bağımlılıkları, root olmayan kullanıcı.
# Derleme bağlamı depo kökü: docker compose build (docker-compose.yml bunu ayarlar).
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
# Sürümler package.json ile aynı (sabit)
RUN npm init -y >/dev/null && npm install --omit=dev --no-audit --no-fund --ignore-scripts \
    ws@8.23.0 yjs@13.6.33 y-protocols@1.0.7 lib0@0.2.120 && npm cache clean --force
COPY server/sync-server.mjs ./sync-server.mjs
USER node
EXPOSE 1234
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:1234/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "sync-server.mjs"]
