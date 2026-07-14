export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="text-destructive mt-1 text-xs">{messages[0]}</p>;
}
