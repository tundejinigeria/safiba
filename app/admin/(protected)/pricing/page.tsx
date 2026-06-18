import { getPlans } from '@/src/actions/admin/pricing'
import { PricingEditor } from './PricingEditor'

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Pricing & Discounts</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage subscription plan pricing and set promotional discounts
        </p>
      </div>

      <PricingEditor initialPlans={plans} />
    </div>
  );
}
