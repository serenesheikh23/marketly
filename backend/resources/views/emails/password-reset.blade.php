@component('mail::layout')
@slot('header')
@component('mail::header', ['url' => config('app.url')])
    {{ config('app.name') }}
@endcomponent
@endslot

# Reset Your Password

Hi there,

We received a request to reset the password for your **{{ config('app.name') }}** account.

Click the button below to choose a new password. This link is valid for 60 minutes.

@component('mail::button', ['url' => $url])
    Reset My Password
@endcomponent

If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.

For your security, never share this link with anyone. The {{ config('app.name') }} team will never ask for your password.

Thanks,
**The {{ config('app.name') }} Team**

@slot('footer')
@component('mail::footer')
    © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
@endcomponent
@endslot
@endcomponent
