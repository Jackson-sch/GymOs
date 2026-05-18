/**
 * Generates a Google Calendar URL for a given event.
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}) {
  const format = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
  
  const url = new URL("https://www.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", event.title);
  url.searchParams.append("dates", `${format(event.start)}/${format(event.end)}`);
  if (event.location) url.searchParams.append("location", event.location);
  if (event.description) url.searchParams.append("details", event.description);
  
  return url.toString();
}

/**
 * Generates an ICS file content for a given event.
 */
export function generateICSContent(event: {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}) {
  const format = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
  
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${format(event.start)}`,
    `DTEND:${format(event.end)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location || ""}`,
    `DESCRIPTION:${event.description || ""}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
