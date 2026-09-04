@component('mail::layout')
{{-- Header --}}
@slot('header')
@component('mail::header', ['url' => config('app.url')])
    {{ config('app.name') }}
@endcomponent
@endslot

{{-- Body --}}
# Order Confirmed

Hi **{{ $order->user->name ?? 'there' }}**,

Thanks for your order. We've received your payment and the details are below.

## Order #{{ $order->id ?? '—' }}
**Placed:** {{ $order->created_at?->toDayDateTimeString() ?? now()->toDayDateTimeString() }}
**Total:** ${{ number_format((float) ($order->total ?? 0), 2) }}
**Status:** {{ ucfirst($order->status ?? 'processing') }}

@if(!empty($order->items) && count($order->items) > 0)
| Item | Qty | Price |
| --- | ---: | ---: |
@foreach($order->items as $item)
| {{ $item->product->name ?? 'Item' }} | {{ $item->quantity }} | ${{ number_format((float) $item->price, 2) }} |
@endforeach
@endif

@if($order->status === 'completed')
Your digital products are ready. Sign in to download them from your dashboard.
@else
Your order is being processed. We'll email you the moment it's ready.
@endif

@component('mail::button', ['url' => config('app.url') . '/dashboard/orders'])
    View Order
@endcomponent

If you have any questions, just reply to this email — we're here to help.

Thanks,
**The {{ config('app.name') }} Team**

@slot('footer')
@component('mail::footer')
    © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
@endcomponent
@endslot
@endcomponent
