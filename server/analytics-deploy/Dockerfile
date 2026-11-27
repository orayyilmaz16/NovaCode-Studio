# NovaCode anonim analitik toplama sunucusu: bağımlılık yok, root olmayan kullanıcı. Derleme bağlamı depo kökü.
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY server/analytics-server.mjs ./analytics-server.mjs
# Veri dizini node kullanıcısına ait (adlandırılmış birim ilk oluşturulunca bu sahipliği devralır)
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8788
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8788/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "analytics-server.mjs"]
