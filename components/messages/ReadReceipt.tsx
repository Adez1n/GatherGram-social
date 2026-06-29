type ReadReceiptProps = {
  read: boolean;
  pending?: boolean;
  failed?: boolean;
};

export default function ReadReceipt({ read, pending, failed }: ReadReceiptProps) {
  if (failed) {
    return <span className="text-[#55E6F7]">fallo</span>;
  }

  if (pending) {
    return <span>enviando</span>;
  }

  return <span>{read ? "✓✓ leido" : "✓ enviado"}</span>;
}
