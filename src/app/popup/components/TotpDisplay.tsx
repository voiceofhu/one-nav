'use client';

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TotpDisplayProps {
  totp?: string;
  onCopy?: () => void;
  compact?: boolean;
}

export function TotpDisplay({
  totp,
  onCopy,
  compact = false,
}: TotpDisplayProps) {
  const { code, progress } = useTotp(totp);

  async function handleCopy() {
    if (!code || code === '000000') {
      toast.error('验证码为空');
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      toast.success('验证码已复制');
      onCopy?.();
    } catch {
      toast.error('复制失败');
    }
  }

  if (!totp) {
    return <span className="text-muted-foreground">未配置</span>;
  }

  return (
    <div
      className={`flex items-center gap-2 ${compact ? 'justify-end' : 'justify-between'}`}
    >
      <div
        className={`flex items-center gap-1.5 font-mono ${compact ? 'text-[10px]' : 'text-[12px]'}`}
      >
        <TotpRing progress={progress} compact={compact} />
        <span className="tracking-widest select-none">
          {code.slice(0, 3)} {code.slice(3)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-md text-muted-foreground hover:text-foreground ${
          compact ? 'h-4 w-4' : 'h-6 w-6'
        }`}
        onClick={handleCopy}
      >
        <Copy className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      </Button>
    </div>
  );
}

export function TotpRing({
  progress,
  compact = false,
}: {
  progress: number;
  compact?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const size = compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';
  const margin = compact ? 'm-[1px]' : 'm-[1.5px]';
  return (
    <div className={`relative ${size}`}>
      <div className="absolute inset-0 rounded-full bg-muted" />
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#22c55e ${pct}%, transparent 0)` }}
      />
      <div
        className={`absolute inset-0 ${margin} rounded-full bg-background`}
      />
    </div>
  );
}

export function useTotp(input?: string) {
  const [code, setCode] = useState('000000');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function tick() {
      const { secret, period, digits } = parseTotp(input);
      if (!secret) {
        setCode('000000');
        setProgress(0);
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      const counter = Math.floor(now / period);
      const remain = period - (now % period);
      const c = await generateTotp(secret, counter, digits);
      if (!mounted) return;
      setCode(c);
      setProgress((period - remain) / period);
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [input]);

  return { code, progress };
}

function parseTotp(input?: string): {
  secret: string | null;
  period: number;
  digits: number;
} {
  if (!input) return { secret: null, period: 30, digits: 6 };
  if (input.startsWith('otpauth://')) {
    try {
      const u = new URL(input);
      const secret = (u.searchParams.get('secret') || '').replace(/\s+/g, '');
      const period = Number(u.searchParams.get('period') || '30');
      const digits = Number(u.searchParams.get('digits') || '6');
      return {
        secret,
        period: isFinite(period) && period > 0 ? period : 30,
        digits: digits === 8 ? 8 : 6,
      };
    } catch {
      return { secret: input, period: 30, digits: 6 };
    }
  }
  return { secret: input, period: 30, digits: 6 };
}

async function generateTotp(
  secretBase32: string,
  counter: number,
  digits: number,
): Promise<string> {
  const key = base32ToBytes(secretBase32.toUpperCase());
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const hmac = new Uint8Array(
    await crypto.subtle.sign('HMAC', cryptoKey, counterBytes),
  );
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  const otp = (bin % 10 ** digits).toString().padStart(digits, '0');
  return otp;
}

function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.replace(/=+$/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}
