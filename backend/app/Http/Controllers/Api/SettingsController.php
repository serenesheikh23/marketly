<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /** Public company info (name, contact, social links) */
    public function company(): JsonResponse
    {
        $settings = Setting::where('group', Setting::GROUP_COMPANY)->get();

        $data = [];
        foreach ($settings as $s) {
            $data[$s->key] = $s->castValue();
        }

        return response()->json(['settings' => $data]);
    }

    /** Legal page content */
    public function legal(string $page): JsonResponse
    {
        $key = match ($page) {
            'terms' => 'legal_terms',
            'privacy' => 'legal_privacy',
            'refund' => 'legal_refund',
            default => null,
        };

        if (! $key) {
            return response()->json(['message' => 'Unknown legal page.'], 404);
        }

        $setting = Setting::where('key', $key)->first();
        $content = $setting?->castValue() ?? '';

        return response()->json([
            'page' => $page,
            'content' => $content,
            'updated_at' => $setting?->updated_at?->toIso8601String(),
        ]);
    }
}
