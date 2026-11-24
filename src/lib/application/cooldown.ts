type DatabaseError = {
  code: string;
  message: string;
  details: string | null;
};

export function getApplicationCooldown(error: DatabaseError | null) {
  if (error?.code !== "PT429" || error.message !== "application_phone_cooldown") {
    return null;
  }

  const retryAfter = Number(error.details);
  if (!Number.isInteger(retryAfter) || retryAfter < 1) {
    return { error: "Bu raqamdan ariza yuborilgan. Yangi arizani biroz keyinroq yuborishingiz mumkin." };
  }

  const totalMinutes = Math.ceil(retryAfter / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const wait = [hours ? `${hours} soat` : "", minutes ? `${minutes} daqiqa` : ""]
    .filter(Boolean)
    .join(" ");

  return {
    error: `Bu raqamdan ariza yuborilgan. Yangi arizani ${wait}dan keyin yuborishingiz mumkin.`,
    retryAfter,
  };
}
