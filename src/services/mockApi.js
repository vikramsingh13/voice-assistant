export async function mockChat(userText) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    reply: `Mock reply to: ${userText}`,
  };
}