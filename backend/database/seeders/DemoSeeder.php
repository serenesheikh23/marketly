<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Enums\OrderStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\VipLevel;
use App\Models\Category;
use App\Models\ExternalStore;
use App\Models\ManualOrderField;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRoles();
        $this->seedSettings();
        $this->seedUsers();
        $this->seedExternalStores();
        $this->seedCategories();
        $this->seedProducts();
        $this->seedSampleOrders();
    }

    private function seedRoles(): void
    {
        foreach (['admin', 'moderator', 'user'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    private function seedSettings(): void
    {
        $defaults = [
            // VIP limits
            ['key' => 'vip1_withdrawal_limit', 'value' => '1000', 'group' => 'vip', 'type' => 'float', 'description' => 'Max withdrawal amount per transaction for VIP1 users'],
            ['key' => 'vip2_withdrawal_limit', 'value' => '2000', 'group' => 'vip', 'type' => 'float', 'description' => 'Max withdrawal amount per transaction for VIP2 users'],

            // VIP fees
            ['key' => 'vip1_fee_percent', 'value' => '3', 'group' => 'vip', 'type' => 'float', 'description' => 'Withdrawal fee % for VIP1'],
            ['key' => 'vip2_fee_percent', 'value' => '1.5', 'group' => 'vip', 'type' => 'float', 'description' => 'Withdrawal fee % for VIP2'],
            ['key' => 'regular_fee_percent', 'value' => '5', 'group' => 'vip', 'type' => 'float', 'description' => 'Withdrawal fee % for regular users'],

            // VIP upgrade pricing
            ['key' => 'vip1_upgrade_price', 'value' => '100', 'group' => 'vip', 'type' => 'float', 'description' => 'Price to upgrade to VIP1'],
            ['key' => 'vip2_upgrade_price', 'value' => '300', 'group' => 'vip', 'type' => 'float', 'description' => 'Price to upgrade to VIP2'],

            // Payment gateway (mock credentials)
            ['key' => 'binance_pay_key', 'value' => 'MOCK_BINANCE_KEY', 'group' => 'payment', 'type' => 'string', 'description' => 'Binance Pay API key'],
            ['key' => 'binance_pay_secret', 'value' => 'MOCK_BINANCE_SECRET', 'group' => 'payment', 'type' => 'string', 'description' => 'Binance Pay API secret'],
            ['key' => 'usdt_wallet_address', 'value' => '0xMOCKUSDTWALLETADDRESS', 'group' => 'payment', 'type' => 'string', 'description' => 'USDT BEP-20 shared deposit wallet'],
        ];

        foreach ($defaults as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }

    private function seedUsers(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@demo.test'],
            [
                'name' => 'Site Admin',
                'password' => Hash::make('password'),
                'vip_level' => VipLevel::Vip2,
                'balance' => 10000,
            ]
        );
        $admin->assignRole('admin');

        $mod = User::updateOrCreate(
            ['email' => 'mod@demo.test'],
            [
                'name' => 'Site Moderator',
                'password' => Hash::make('password'),
                'vip_level' => VipLevel::Vip1,
                'balance' => 2000,
            ]
        );
        $mod->assignRole('moderator');

        User::updateOrCreate(
            ['email' => 'user@demo.test'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
                'vip_level' => VipLevel::None,
                'balance' => 500,
            ]
        );

        User::updateOrCreate(
            ['email' => 'vip1@demo.test'],
            [
                'name' => 'VIP1 Demo',
                'password' => Hash::make('password'),
                'vip_level' => VipLevel::Vip1,
                'balance' => 1500,
            ]
        );

        User::updateOrCreate(
            ['email' => 'vip2@demo.test'],
            [
                'name' => 'VIP2 Demo',
                'password' => Hash::make('password'),
                'vip_level' => VipLevel::Vip2,
                'balance' => 5000,
            ]
        );
    }

    private function seedExternalStores(): void
    {
        ExternalStore::updateOrCreate(['name' => 'GameStore API'], [
            'url' => 'https://api.gamestore.example.com',
            'api_key' => 'mock-key-1',
            'type' => 'api',
            'is_active' => true,
            'notes' => 'Reseller API for game keys',
        ]);
        ExternalStore::updateOrCreate(['name' => 'CardHub Manual'], [
            'url' => 'https://cardhub.example.com',
            'api_key' => null,
            'type' => 'manual',
            'is_active' => true,
            'notes' => 'Manually fulfilled card store',
        ]);
    }

    private function seedCategories(): void
    {
        $categories = [
            ['name' => 'Games', 'type' => CategoryType::Auto, 'icon' => 'gamepad', 'sort_order' => 1, 'description' => 'Game keys, accounts, and in-game items'],
            ['name' => 'Chat Applications', 'type' => CategoryType::Auto, 'icon' => 'message', 'sort_order' => 2, 'description' => 'Premium subscriptions for chat and messaging apps'],
            ['name' => 'Cards', 'type' => CategoryType::Auto, 'icon' => 'credit-card', 'sort_order' => 3, 'description' => 'Gift and prepaid cards'],
            ['name' => 'Balance Top-ups', 'type' => CategoryType::Auto, 'icon' => 'wallet', 'sort_order' => 4, 'description' => 'Mobile balance and top-ups'],
            ['name' => 'Design Programs', 'type' => CategoryType::Auto, 'icon' => 'design', 'sort_order' => 5, 'description' => 'Software licenses for design tools'],
            ['name' => 'Screen Subscriptions', 'type' => CategoryType::Auto, 'icon' => 'monitor', 'sort_order' => 6, 'description' => 'Streaming service subscriptions'],
            ['name' => 'VPN Subscriptions', 'type' => CategoryType::Auto, 'icon' => 'server', 'sort_order' => 7, 'description' => 'VPN access plans'],
            ['name' => 'Account Verification', 'type' => CategoryType::Manual, 'icon' => 'check-circle', 'sort_order' => 8, 'description' => 'Manual account verification services'],
            ['name' => 'Artificial Intelligence', 'type' => CategoryType::Auto, 'icon' => 'cpu', 'sort_order' => 9, 'description' => 'AI tool subscriptions'],
            ['name' => 'Manual Charging & Store Offers', 'type' => CategoryType::Manual, 'icon' => 'handshake', 'sort_order' => 10, 'description' => 'Custom store offers and manual charging'],
            ['name' => 'Social Media Services', 'type' => CategoryType::Manual, 'icon' => 'share', 'sort_order' => 11, 'description' => 'Telegram, Facebook, Twitter and other social media services'],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($data['name'])],
                $data
            );
        }

        // Add manual-order fields for the social media category
        $social = Category::where('slug', 'social-media-services')->first();
        if ($social) {
            $fields = [
                ['key' => 'platform', 'label' => 'Platform', 'type' => 'select', 'required' => true, 'options' => ['telegram', 'facebook', 'twitter', 'instagram', 'youtube'], 'sort_order' => 1, 'placeholder' => 'Select platform'],
                ['key' => 'service_type', 'label' => 'Service Type', 'type' => 'select', 'required' => true, 'options' => ['members', 'followers', 'likes', 'views', 'reactions'], 'sort_order' => 2, 'placeholder' => 'Select service'],
                ['key' => 'link', 'label' => 'Profile / Channel Link', 'type' => 'text', 'required' => true, 'sort_order' => 3, 'placeholder' => 'https://t.me/...'],
                ['key' => 'quantity', 'label' => 'Quantity', 'type' => 'number', 'required' => true, 'sort_order' => 4, 'placeholder' => 'e.g. 1000'],
                ['key' => 'notes', 'label' => 'Additional Notes', 'type' => 'textarea', 'required' => false, 'sort_order' => 5, 'placeholder' => 'Any special instructions'],
            ];
            foreach ($fields as $field) {
                ManualOrderField::updateOrCreate(
                    ['category_id' => $social->id, 'key' => $field['key']],
                    $field
                );
            }
        }

        // Manual fields for Account Verification
        $verify = Category::where('slug', 'account-verification')->first();
        if ($verify) {
            $fields = [
                ['key' => 'service', 'label' => 'Verification Service', 'type' => 'select', 'required' => true, 'options' => ['facebook_blue', 'instagram_blue', 'twitter_blue', 'youtube_monetization', 'telegram_premium'], 'sort_order' => 1, 'placeholder' => 'Select service'],
                ['key' => 'account_link', 'label' => 'Account Link / Username', 'type' => 'text', 'required' => true, 'sort_order' => 2, 'placeholder' => '@username or profile URL'],
                ['key' => 'documents_info', 'label' => 'Document Description', 'type' => 'textarea', 'required' => true, 'sort_order' => 3, 'placeholder' => 'Describe the documents you can provide'],
            ];
            foreach ($fields as $field) {
                ManualOrderField::updateOrCreate(
                    ['category_id' => $verify->id, 'key' => $field['key']],
                    $field
                );
            }
        }
    }

    private function seedProducts(): void
    {
        $store = ExternalStore::where('name', 'GameStore API')->first();
        $categories = Category::pluck('id', 'slug');

        $products = [
            // Games
            ['category' => 'games', 'name' => 'Steam Gift Card $50', 'price' => 50.00, 'stock' => 100, 'store' => $store?->id],
            ['category' => 'games', 'name' => 'PlayStation Plus 3 Months', 'price' => 25.00, 'stock' => 50, 'store' => null],
            ['category' => 'games', 'name' => 'Xbox Game Pass Ultimate 1 Month', 'price' => 14.99, 'stock' => 80, 'store' => null],

            // Chat
            ['category' => 'chat-applications', 'name' => 'Telegram Premium 3 Months', 'price' => 12.99, 'stock' => 200, 'store' => null],
            ['category' => 'chat-applications', 'name' => 'WhatsApp Business API Setup', 'price' => 49.00, 'stock' => 30, 'store' => null],

            // Cards
            ['category' => 'cards', 'name' => 'Amazon Gift Card $25', 'price' => 25.00, 'stock' => 200, 'store' => $store?->id],
            ['category' => 'cards', 'name' => 'iTunes Gift Card $50', 'price' => 50.00, 'stock' => 150, 'store' => null],

            // Balance
            ['category' => 'balance-top-ups', 'name' => 'Mobile Top-up $20', 'price' => 20.00, 'stock' => 500, 'store' => null],

            // Design
            ['category' => 'design-programs', 'name' => 'Adobe Creative Cloud 1 Month', 'price' => 54.99, 'stock' => 40, 'store' => null],
            ['category' => 'design-programs', 'name' => 'Figma Professional 1 Year', 'price' => 180.00, 'stock' => 25, 'store' => null],

            // Streaming
            ['category' => 'screen-subscriptions', 'name' => 'Netflix Premium 1 Month', 'price' => 17.99, 'stock' => 100, 'store' => null],
            ['category' => 'screen-subscriptions', 'name' => 'Spotify Premium 6 Months', 'price' => 59.94, 'stock' => 80, 'store' => null],

            // VPN
            ['category' => 'vpn-subscriptions', 'name' => 'NordVPN 1 Year', 'price' => 59.99, 'stock' => 60, 'store' => null],

            // Account Verification (manual)
            ['category' => 'account-verification', 'name' => 'Social Media Verification', 'price' => 49.00, 'stock' => 999, 'type' => CategoryType::Manual],

            // AI
            ['category' => 'artificial-intelligence', 'name' => 'ChatGPT Plus 1 Month', 'price' => 20.00, 'stock' => 100, 'store' => null],
            ['category' => 'artificial-intelligence', 'name' => 'Midjourney Pro 1 Month', 'price' => 30.00, 'stock' => 80, 'store' => null],

            // Manual Charging
            ['category' => 'manual-charging-store-offers', 'name' => 'Custom Store Offer', 'price' => 25.00, 'stock' => 999, 'type' => CategoryType::Manual],

            // Social Media Services (manual)
            ['category' => 'social-media-services', 'name' => 'Telegram Members 1000', 'price' => 15.00, 'stock' => 999, 'type' => CategoryType::Manual],
            ['category' => 'social-media-services', 'name' => 'Facebook Page Likes 1000', 'price' => 25.00, 'stock' => 999, 'type' => CategoryType::Manual],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($p['name'])],
                [
                    'category_id' => $categories[$p['category']] ?? null,
                    'name' => $p['name'],
                    'description' => 'High-quality digital product delivered automatically after purchase.',
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'type' => $p['type'] ?? CategoryType::Auto,
                    'is_active' => true,
                    'external_store_id' => $p['store'] ?? null,
                ]
            );
        }
    }

    private function seedSampleOrders(): void
    {
        $vip2 = User::where('email', 'vip2@demo.test')->first();
        $vip1 = User::where('email', 'vip1@demo.test')->first();
        $user = User::where('email', 'user@demo.test')->first();
        $spotify = Product::where('slug', 'spotify-premium-6-months')->first();
        $telegram = Product::where('slug', 'telegram-premium-3-months')->first();
        $telegramMembers = Product::where('slug', 'telegram-members-1000')->first();

        if ($vip2 && $spotify) {
            $order = Order::create([
                'user_id' => $vip2->id,
                'status' => OrderStatus::Completed,
                'subtotal' => $spotify->price,
                'fee' => 0,
                'total' => $spotify->price,
                'payment_method' => 'cash_wallet',
                'payment_ref' => 'demo-spotify-1',
            ]);
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $spotify->id,
                'quantity' => 1,
                'unit_price' => $spotify->price,
            ]);
        }

        if ($vip1 && $telegram) {
            $order = Order::create([
                'user_id' => $vip1->id,
                'status' => OrderStatus::Processing,
                'subtotal' => $telegram->price,
                'fee' => 0,
                'total' => $telegram->price,
                'payment_method' => 'binance_pay',
                'payment_ref' => 'demo-tg-1',
            ]);
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $telegram->id,
                'quantity' => 1,
                'unit_price' => $telegram->price,
            ]);
        }

        if ($user && $telegramMembers) {
            $order = Order::create([
                'user_id' => $user->id,
                'status' => OrderStatus::Pending,
                'subtotal' => $telegramMembers->price,
                'fee' => 0,
                'total' => $telegramMembers->price,
                'payment_method' => 'cash_wallet',
            ]);
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $telegramMembers->id,
                'quantity' => 1,
                'unit_price' => $telegramMembers->price,
                'payload' => [
                    'platform' => 'telegram',
                    'service_type' => 'members',
                    'link' => 'https://t.me/demo_channel',
                    'quantity' => '1000',
                ],
            ]);
        }

        // Sample transactions
        if ($vip2) {
            Transaction::create([
                'user_id' => $vip2->id,
                'type' => TransactionType::Deposit,
                'amount' => 1000,
                'fee' => 0,
                'status' => TransactionStatus::Approved,
                'method' => 'binance_pay',
                'gateway_ref' => 'demo-deposit-1',
            ]);
        }
        if ($vip1) {
            Transaction::create([
                'user_id' => $vip1->id,
                'type' => TransactionType::Withdrawal,
                'amount' => 500,
                'fee' => 15,
                'status' => TransactionStatus::Pending,
                'method' => 'usdt',
            ]);
        }
    }
}
