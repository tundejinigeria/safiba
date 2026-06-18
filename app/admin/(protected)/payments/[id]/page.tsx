import Link from 'next/link';
import { ArrowLeft, CreditCard, User, Package } from 'lucide-react';
import { getPaymentDetail } from '@/src/actions/admin/payments';
import { StatusBadge } from '@/src/components/admin/StatusBadge';

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPaymentDetail(id);

  if (!data) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <p className="text-neutral-500">Payment not found</p>
        <Link href="/admin/payments" className="text-sm text-blue-600 mt-2 inline-block">← Back to payments</Link>
      </div>
    );
  }

  const { payment, subscription, user } = data;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto">
      <Link href="/admin/payments" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to payments
      </Link>

      {/* Payment Header */}
      <div className="border border-neutral-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
              <CreditCard size={18} className="text-neutral-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">₦{payment.amount.toLocaleString()}</h1>
              <p className="text-sm text-neutral-500">{payment.billing_cycle} payment</p>
            </div>
          </div>
          <StatusBadge status={payment.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Date</p>
            <p className="text-sm text-neutral-900 mt-1">
              {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Reference</p>
            <p className="text-sm text-neutral-900 mt-1 font-mono truncate">{payment.paystack_reference || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Billing Cycle</p>
            <p className="text-sm text-neutral-900 mt-1 capitalize">{payment.billing_cycle}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Created</p>
            <p className="text-sm text-neutral-900 mt-1">
              {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Linked User */}
      <div className="border border-neutral-200 bg-white mb-6">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <User size={14} className="text-indigo-500" />
          <h2 className="text-sm font-medium text-neutral-900">User</h2>
        </div>
        {user ? (
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">{user.name || 'No name'}</p>
              <p className="text-xs text-neutral-500">{user.email || '—'}</p>
            </div>
            <Link
              href={`/admin/users/${user.id}`}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              View profile →
            </Link>
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-neutral-400">User not found</p>
        )}
      </div>

      {/* Linked Subscription */}
      <div className="border border-neutral-200 bg-white">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <Package size={14} className="text-emerald-500" />
          <h2 className="text-sm font-medium text-neutral-900">Subscription</h2>
        </div>
        {subscription ? (
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Plan</p>
                <p className="text-sm text-neutral-900 mt-1">{subscription.plan_name || subscription.plan_id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Billing Cycle</p>
                <p className="text-sm text-neutral-900 mt-1 capitalize">{subscription.billing_cycle}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <StatusBadge status={subscription.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Member Cap</p>
                <p className="text-sm text-neutral-900 mt-1">{subscription.member_cap}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Amount</p>
                <p className="text-sm text-neutral-900 mt-1">₦{subscription.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Next Payment</p>
                <p className="text-sm text-neutral-900 mt-1">
                  {subscription.next_payment_date ? new Date(subscription.next_payment_date).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-neutral-400">No linked subscription found</p>
        )}
      </div>
    </div>
  );
}
