# 🚪 GymOS Hardware Access Hub (Integración de Molinetes y Torniquetes)

Guía completa para conectar molinetes, torniquetes, relés de apertura y lectores biométricos (huella, rostro, tarjeta RFID) con **GymOS Platform**.

---

## 🏗️ 1. Arquitectura de Integración (IoT Access Controller)

GymOS admite tres métodos de integración con hardware de accesos:

```text
┌─────────────────────────┐          HTTP / ISAPI / ADMS        ┌─────────────────────────┐
│ Lector / Torniquete     ├────────────────────────────────────►│ GymOS Access Gateway    │
│ (ZKTeco / Hikvision)    │  (Evento: Lectura de Huella/QR)     │ (Servidor / Local Agent)│
└─────────────────────────┘                                     └────────────┬────────────┘
                                                                             │
                                                              1. Consultar Membresía
                                                              2. Validar Estado & Horario
                                                                             │
                                                                ┌────────────▼────────────┐
                                                                │ Prisma DB & Cache       │
                                                                │ (Active Member Check)   │
                                                                └────────────┬────────────┘
                                                                             │
                                                              3. Respuesta de Apertura
                                                                             │
                                                                ┌────────────▼────────────┐
                                                                │ Relé de Torniquete      │
                                                                │ Command: OPEN_DOOR      │
                                                                └─────────────────────────┘
```

---

## 🔌 2. Métodos de Conexión Soportados

### A. **ZKTeco (Protocolo ADMS / Push SDK)**
- **Servidor ADMS en GymOS**: `http://<IP_GymOS>:8088/iclock/cdata`
- **Configuración en el biométrico ZKTeco**:
  1. Acceda al menú del dispositivo ZKTeco > *Configuración de Red* > *Configuración de Servidor Web (ADMS)*.
  2. Habilite **Servidor de Dominio / IP**.
  3. Ingrese la IP o dominio del GymOS Access Gateway.
  4. Puerto: `8088` (o el puerto configurado en `IOT_GATEWAY_URL`).
  5. Habilite **Push Data**.

### B. **Hikvision (Protocolo ISAPI / Event Webhooks)**
- **Endpoint Webhook**: `https://su-gimnasio.app/api/checkin/hikvision`
- **Configuración en Terminal Hikvision**:
  1. Abra el panel web de la cámara o terminal facial Hikvision en el navegador (`http://192.168.1.X`).
  2. Vaya a *Network* > *Advanced Settings* > *HTTP Listening / Event HTTP Push*.
  3. Configure la URL del webhook de GymOS e ingrese el Secret Key de firma `IOT_AUTH_SECRET`.

### C. **Relé HTTP Webhook (Raspberry Pi / ESP32 / Arduino Ethernet)**
Para molinetes analógicos impulsados por relé de pulso de 12V:
- **Petición de Apertura (Disparada por GymOS Kiosk / QR Reader)**:
  - **Método**: `POST`
  - **Endpoint**: `http://<IP_LOCAL_RELE>/api/relay/pulse`
  - **Payload**:
    ```json
    {
      "door_id": 1,
      "pulse_ms": 1000,
      "secret": "gym_iot_sec_..."
    }
    ```

---

## 🛡️ 3. Parámetros de Configuración en GymOS Panel

En **Ajustes > Canales API > Hardware Access Hub**:

1. **`IOT_GATEWAY_URL`**:
   - URL base donde corre el servidor de escucha de torniquetes (ej: `https://gateway-sede1.local:8443` o `https://acceso.migimnasio.com`).
2. **`IOT_AUTH_SECRET`**:
   - Clave criptográfica compartida entre GymOS y el controlador local para firmar y verificar peticiones de apertura.

---

## ⚡ 4. Diagnóstico y Prueba de Salud (*Ping Test*)

Puede probar la conexión del gateway en tiempo real desde la consola de **GymOS Canales API**:
- Presione **Probar Conexión** en la tarjeta de *Hardware Access Hub*.
- El sistema enviará un paquete de prueba HTTP `GET /health` con la firma HMAC.
- Una respuesta `200 OK` con latencia menor a 100ms indica que el molinete está listo para validar accesos en vivo.
