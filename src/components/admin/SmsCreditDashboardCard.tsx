import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardSmsCredit } from '@/lib/sms-credit-types';

type Props = {
  smsCredit: DashboardSmsCredit;
};

export function SmsCreditDashboardCard({ smsCredit }: Props) {
  const blinkLow = smsCredit.status === 'ok' && smsCredit.level === 'low';
  const blinkEmpty = smsCredit.status === 'ok' && smsCredit.level === 'empty';

  const borderClass =
    smsCredit.status === 'ok' && smsCredit.level === 'empty'
      ? 'border-red-200/80'
      : smsCredit.status === 'ok' && smsCredit.level === 'low'
        ? 'border-amber-200/80'
        : 'border-slate-200/60';

  const iconWrap =
    smsCredit.status === 'ok' && smsCredit.level === 'empty'
      ? 'bg-red-50/50 text-red-600 border-red-100/50'
      : smsCredit.status === 'ok' && smsCredit.level === 'low'
        ? 'bg-amber-50/50 text-amber-600 border-amber-100/50'
        : 'bg-violet-50/50 text-violet-600 border-violet-100/50';

  let mainValue: string;
  let subline: string | null = null;

  if (smsCredit.status === 'not_connected') {
    mainValue = 'SMS is not connected';
  } else if (smsCredit.status === 'load_failed') {
    mainValue = '—';
    subline = 'The balance could not be loaded';
  } else {
    mainValue = smsCredit.sms_left.toLocaleString('en-GH');
    if (smsCredit.level === 'low') {
      subline = 'Running low, top up soon';
    } else if (smsCredit.level === 'empty') {
      subline = 'SMS credit is empty, texts are not being sent';
    } else {
      subline = 'texts left';
    }
  }

  const sublineClass =
    smsCredit.status === 'ok' && smsCredit.level === 'empty'
      ? 'text-red-600 font-semibold'
      : smsCredit.status === 'ok' && smsCredit.level === 'low'
        ? 'text-amber-700 font-semibold'
        : 'text-slate-400';

  const showTopUp = smsCredit.status !== 'not_connected';

  return (
    <Card
      className={`bg-white hover:border-slate-300/80 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden ${borderClass} ${
        blinkEmpty ? 'sms-credit-double-blink-empty' : blinkLow ? 'sms-credit-double-blink' : ''
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
        <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SMS credit</CardTitle>
        <div className="flex items-center gap-2">
          {showTopUp ? (
            <Button asChild size="sm" className="h-8 rounded-lg font-bold text-xs">
              <Link href="/admin/sms-credit">Top up</Link>
            </Button>
          ) : null}
          <div className={`p-2 rounded-xl border transition-colors ${iconWrap}`}>
            <MessageSquare className="h-4 w-4" aria-hidden />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div
          className={`font-extrabold text-slate-900 tracking-tight tabular-nums ${
            smsCredit.status === 'not_connected' ? 'text-base leading-snug' : 'text-2xl md:text-3xl mt-1'
          }`}
        >
          {mainValue}
        </div>
        {subline ? (
          <p className={`text-[11px] font-semibold mt-2 flex items-center gap-1 ${sublineClass}`}>{subline}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}