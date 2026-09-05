<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->groupBy('group');

        return response()->json(['settings' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string'],
            'value' => ['required', 'string'],
            'type' => ['sometimes', 'string', 'in:string,float,int,boolean,json'],
        ]);

        Setting::updateOrCreate(
            ['key' => $data['key']],
            [
                'value' => $data['value'],
                'type' => $data['type'] ?? 'string',
            ]
        );

        return response()->json(['message' => 'Setting updated.']);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $items = $request->validate([
            'items' => ['required', 'array'],
            'items.*.key' => ['required', 'string'],
            'items.*.value' => ['required', 'string'],
            'items.*.type' => ['sometimes', 'string'],
        ]);

        foreach ($items['items'] as $item) {
            Setting::updateOrCreate(
                ['key' => $item['key']],
                ['value' => $item['value'], 'type' => $item['type'] ?? 'string']
            );
        }

        return response()->json(['message' => 'Settings updated.']);
    }

    /** Update company info (admin only) */
    public function updateCompany(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:120'],
            'support_email' => ['required', 'email', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'facebook_url' => ['nullable', 'string', 'max:255'],
            'instagram_url' => ['nullable', 'string', 'max:255'],
            'twitter_url' => ['nullable', 'string', 'max:255'],
            'telegram_url' => ['nullable', 'string', 'max:255'],
        ]);

        // CRITICAL: Remove empty/null fields so they don't crash the database
        $data = array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });

        foreach ($data as $key => $value) {
            Setting::set($key, $value, Setting::GROUP_COMPANY);
        }

        return response()->json(['message' => 'Company info updated.', 'settings' => $data]);
    }

    /** Update legal page content (admin only) */
    public function updateLegal(Request $request, string $page): JsonResponse
    {
        $keyPrefix = match ($page) {
            'terms'   => 'legal_terms',
            'privacy' => 'legal_privacy',
            'refund'  => 'legal_refund',
            default   => null,
        };

        if (! $keyPrefix) {
            return response()->json(['message' => 'Unknown legal page.'], 404);
        }

        $data = $request->validate([
            'content_en' => ['present', 'nullable', 'string'],
            'content_ar' => ['present', 'nullable', 'string'],
        ]);

        if (isset($data['content_en'])) {
            Setting::set("{$keyPrefix}_en", $data['content_en'], Setting::GROUP_LEGAL);
        }
        if (isset($data['content_ar'])) {
            Setting::set("{$keyPrefix}_ar", $data['content_ar'], Setting::GROUP_LEGAL);
        }

        return response()->json(['message' => 'Legal page updated.', 'page' => $page]);
    }
}
