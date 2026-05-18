/**
 * GymOS - Test rápido de conectividad de APIs
 * Verifica que los servicios y endpoints principales estén respondiendo correctamente.
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000";

interface TestEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: any;
  expectedStatus: number;
}

const endpoints: TestEndpoint[] = [
  {
    name: "Health Check (DB Connectivity)",
    method: "GET",
    path: "/api/health",
    expectedStatus: 200,
  },
  {
    name: "List Trainers",
    method: "GET",
    path: "/api/trainers",
    expectedStatus: 200,
  },
  {
    name: "Check-in Stats",
    method: "GET",
    path: "/api/checkin",
    expectedStatus: 200,
  },
  {
    name: "Check-in QR (Invalid QR handling)",
    method: "POST",
    path: "/api/checkin",
    body: { qrCode: "" },
    expectedStatus: 400,
  },
  {
    name: "Trainer Not Found handling",
    method: "GET",
    path: "/api/trainers?id=non_existent_id",
    expectedStatus: 404,
  },
];

async function runApiTests() {
  console.log(`\n🚀 Iniciando prueba rápida de APIs en: ${BASE_URL}\n`);
  console.log("=====================================================================");
  console.log(`${"ENDPOINT".padEnd(35)} | ${"MÉTODO".padEnd(8)} | ${"STATUS".padEnd(8)} | ${"TIEMPO".padEnd(8)}`);
  console.log("=====================================================================");

  let passed = 0;
  let failed = 0;
  const startTimeTotal = Date.now();

  for (const ep of endpoints) {
    const url = `${BASE_URL}${ep.path}`;
    const startTime = Date.now();
    let status = 0;
    let isSuccess = false;
    let errorMsg = "";

    try {
      const options: RequestInit = {
        method: ep.method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "GymOS-ApiTest/1.0",
        },
      };

      if (ep.body && (ep.method === "POST" || ep.method === "PUT")) {
        options.body = JSON.stringify(ep.body);
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
      options.signal = controller.signal;

      const res = await fetch(url, options);
      clearTimeout(id);

      status = res.status;
      isSuccess = status === ep.expectedStatus;
      
      // Intentar leer el body para detalles
      try {
        await res.text();
      } catch (_) {}
    } catch (err: any) {
      errorMsg = err.name === "AbortError" ? "TIMEOUT" : "CONN_ERROR";
    }

    const latency = Date.now() - startTime;
    const latencyStr = `${latency}ms`;
    const statusDisplay = isSuccess ? `✅ ${status}` : (status ? `❌ ${status}` : `❌ ${errorMsg}`);

    console.log(`${ep.name.padEnd(35)} | ${ep.method.padEnd(8)} | ${statusDisplay.padEnd(8)} | ${latencyStr.padEnd(8)}`);

    if (isSuccess) {
      passed++;
    } else {
      failed++;
    }
  }

  const totalTime = Date.now() - startTimeTotal;
  console.log("=====================================================================");
  console.log(`\n📋 RESULTADOS DE LA PRUEBA:`);
  console.log(`   • Total endpoints probados: ${endpoints.length}`);
  console.log(`   • Correctos (Passed): ${passed}`);
  console.log(`   • Fallidos (Failed): ${failed}`);
  console.log(`   • Tiempo total: ${totalTime}ms\n`);

  if (failed === 0) {
    console.log("🎉 ¡Todas las pruebas de conectividad API pasaron exitosamente!");
    process.exit(0);
  } else {
    console.log("⚠️ Algunas pruebas no devolvieron el código de estado esperado. Verifique si el servidor local está corriendo o revise los logs.");
    process.exit(1);
  }
}

runApiTests();
