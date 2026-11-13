import { sendZohoTestMessage, testMailbox, testRecipient, zohoTestMessages } from "../lib/zohoOutboundTest.ts";
const [command, selectedStep, ...extra] = process.argv.slice(2);
try {
  if (!command) {
    console.log(JSON.stringify({ mode: "simulation", from: testMailbox, to: testRecipient, messages: zohoTestMessages() }, null, 2));
  } else {
    if (command !== "--send-one" || !/^[0-3]$/.test(selectedStep ?? "") || extra.length || process.env.PEI_ZOHO_TEST_SEND !== "true")
      throw new Error("Envío bloqueado. Solo se permite un paso de prueba autorizado.");
    const result = await sendZohoTestMessage({
      clientId: process.env.ZOHO_TEST_CLIENT_ID ?? "", clientSecret: process.env.ZOHO_TEST_CLIENT_SECRET ?? "",
      refreshToken: process.env.ZOHO_TEST_REFRESH_TOKEN ?? "", accountId: process.env.ZOHO_TEST_ACCOUNT_ID ?? "",
    }, Number(selectedStep));
    console.log(JSON.stringify({ accepted: result.accepted, step: Number(selectedStep) }));
  }
} catch (error) {
  console.error(error instanceof Error && !["TypeError", "SyntaxError"].includes(error.name) ? error.message : "No se pudo verificar el acceso a Zoho.");
  process.exitCode = 1;
}
