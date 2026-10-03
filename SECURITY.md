# SECURITY.md — POLÍTICA DE SEGURIDAD Y CERO CUSTODIA

## 1. Principio Fundamental de Cero Custodia
Esta aplicación está diseñada bajo el principio de minimización absoluta de confianza:
- **NUNCA** solicita frases semilla (Seed Phrases / BIP 39).
- **NUNCA** solicita ni almacena claves privadas (Private Keys).
- **NUNCA** solicita contraseñas bancarias ni secretos de API privadas en el frontend.

## 2. Auditoría de Smart Contracts
La auditoría de contratos inteligentes es un **Preliminary AI Security Review** estático y heurístico. Detecta:
- Violaciones de Checks-Effects-Interactions (Reentrancy).
- Uso peligroso de tx.origin para autenticación.
- Manipulación de oráculos por reservas de pools con préstamos relámpago.
- Ausencia de SafeERC20 en tokens no conformes al estándar.
- Incompatibilidades de retiros y opcodes obsoletos (selfdestruct).

*Descargo de responsabilidad*: Esta herramienta proporciona asistencia técnica al desarrollador. No reemplaza ni sustituye una auditoría de seguridad formal independiente realizada por auditores humanos certificados.
