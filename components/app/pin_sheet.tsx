"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { IcLock } from "@/components/app/icons";
import { ApiError, errorMessage } from "@/lib/api/client";
import { Alert, Button, Modal, PinInput } from "@/components/app/ui";
import { useAccount } from "@/features/app/account_context";

// Confirms a money movement with the transaction PIN. The caller's `onConfirm`
// performs the request with the PIN; this sheet only handles entry and errors.
export function PinSheet({
  open,
  onClose,
  title = "Confirm with your PIN",
  summary,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  summary?: ReactNode;
  onConfirm: (pin: string) => Promise<void>;
}) {
  const { needsPin } = useAccount();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (open) {
      setValue("");
      setError(null);
      setInvalid(false);
    }
  }, [open]);

  const submit = async (pinValue = value) => {
    if (pinValue.length !== 4 || busy) return;
    setBusy(true);
    setError(null);
    setInvalid(false);
    try {
      await onConfirm(pinValue);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      if (code === "INVALID_TRANSACTION_PIN") setInvalid(true);
      setError(errorMessage(e));
      setValue("");
    } finally {
      setBusy(false);
    }
  };

  if (needsPin) {
    return (
      <Modal open={open} onClose={onClose} title="Set your transaction PIN first">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-14 place-items-center text-4xl text-brand-600">
            <IcLock />
          </div>
          <p className="text-ink-soft">Every payment on Wymlink is approved with a 4-digit PIN that only you know. It takes a few seconds to set up.</p>
          <Button block href="/dashboard/security?setup=pin">
            Set my PIN
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={title} dismissible={!busy}>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {summary && <div className="rounded-2xl bg-canvas p-4">{summary}</div>}
        <PinInput value={value} onChange={setValue} autoFocus disabled={busy} invalid={invalid} label="Transaction PIN" onComplete={(v) => void submit(v)} />
        {error && <Alert tone="bad">{error}</Alert>}
        <Button type="submit" block loading={busy} disabled={value.length !== 4}>
          Confirm
        </Button>
        <Link href="/dashboard/security?reset=pin" className="text-center text-sm font-medium text-brand-600 hover:underline">
          Forgot PIN?
        </Link>
      </form>
    </Modal>
  );
}
