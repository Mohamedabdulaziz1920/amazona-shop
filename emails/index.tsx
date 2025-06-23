import { Resend } from 'resend'
import { render } from '@react-email/render'
import { IOrder } from '@/lib/db/models/order.model'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'
import { getSetting } from '@/lib/actions/setting.actions'

const resend = new Resend(process.env.RESEND_API_KEY as string)

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  // استيراد مكون البريد داخل الدالة بشكل ديناميكي
  const { default: PurchaseReceiptEmail } = await import('./purchase-receipt')

  // جلب بيانات الإعدادات
  const { site } = await getSetting()

  // تحويل React component إلى HTML
  const html = await render(
    <PurchaseReceiptEmail order={order} siteUrl={site.url} />
  )

  // إرسال البريد
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Order Confirmation',
    html,
  })
}

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  // استيراد مكون البريد داخل الدالة بشكل ديناميكي
  const { default: AskReviewOrderItemsEmail } = await import(
    './ask-review-order-items'
  )

  // جلب بيانات الإعدادات
  const { site } = await getSetting()

  // حساب موعد الإرسال بعد يوم واحد من الآن
  const scheduledAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()

  // تحويل React component إلى HTML
  const html = await render(
    <AskReviewOrderItemsEmail order={order} siteUrl={site.url} />
  )

  // إرسال البريد مع الجدولة
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Review your order items',
    html,
    scheduledAt,
  })
}
