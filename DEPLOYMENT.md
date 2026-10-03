# DEPLOYMENT.md — DESPLIEGUE EN PRODUCCIÓN

## 1. Requisitos
- Node.js 20+
- Soporte para variables de entorno (vía `.env` o Secret Manager).

## 2. Construcción de Artefactos Estáticos
```bash
npm run build
```
Los archivos optimizados para producción se generan en el directorio `dist/`.

## 3. Seguridad de Ejecución
- Asegurar cabeceras HTTP de seguridad (Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security).
- Jamás exponer API keys privadas en variables que comiencen con `VITE_` si contienen permisos de escritura o fondos.
