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
}
